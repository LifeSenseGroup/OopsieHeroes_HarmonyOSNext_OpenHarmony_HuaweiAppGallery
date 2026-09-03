package com.lifesensegroup.oopsieheroes;
import android.util.Log;

import java.util.Arrays;

import ca.uol.aig.fftpack.RealDoubleFFT;

import static java.lang.Math.PI;
import static java.lang.Math.abs;
import static java.lang.Math.asin;
import static java.lang.Math.log10;
import static java.lang.Math.pow;
import static java.lang.Math.round;
import static java.lang.Math.sin;
import static java.lang.Math.sqrt;

// Short Time Fourier Transform
class STFT {
    // data for frequency Analysis
    private double[] spectrumAmpOutCum;
    private double[] spectrumAmpOutTmp;
     double[] spectrumAmpOut;
     double[] spectrumAmpOutDB;
    private double[] spectrumAmpIn;
    private double[] spectrumAmpInTmp;
    private double[] wnd;
    private double wndEnergyFactor = 1;           // used to keep energy invariant under different window
    private int sampleRate;
    private int fftLen;
    private int hopLen;                           // control overlap of FFTs = (1 - lopLen/fftLen)*100%
    private int spectrumAmpPt;
    private int bandpassWidth = 50;


    //averaging
    private final int numReadingsDB = AnalyzerParameters.INSTANCE.getMaximumFrequencySpectral();
    private int [] readingsDB = new int[numReadingsDB];      // the readings from the analog input
    int readIndexDB = 0;              // the index of the current reading
    private double totalDB = 0;                  // the running total
    static double averageDB = 0;                // the average

    private int nAnalysed = 0;
    private RealDoubleFFT spectrumAmpFFT;
    private boolean boolAWeighting = false;
    private double cumRMS = 0;
    private int    cntRMS = 0;
    private double outRMS = 0;

    private double[] dBAFactor;    // multiply to power spectrum to get A-weighting
    private double[] micGain;

    private double sqr(double x) { return x*x; }

    // Generate multiplier for A-weighting
    private void initDBAFactor(int fftlen, double sampleRate) {
        dBAFactor = new double[fftlen/2+1];
        for (int i = 0; i < fftlen/2+1; i++) {
            double f = (double)i/fftlen * sampleRate;
            double r = sqr(12200)*sqr(sqr(f)) / ((f*f+sqr(20.6)) * sqrt((f*f+sqr(107.7)) * (f*f+sqr(737.9))) * (f*f+sqr(12200)));
            dBAFactor[i] = r*r*1.58489319246111;  // 1.58489319246111 = 10^(1/5)
        }
    }

    private void initWindowFunction(int fftlen, String wndName) {
        wnd = new double[fftlen];

        for (int i=0; i < wnd.length; i++) {  // Bartlett
            wnd[i] = asin(sin(PI*i/wnd.length))/PI*2;
        }

        double normalizeFactor = 0;
        for (int i=0; i<wnd.length; i++) {
            normalizeFactor += wnd[i];
        }
        normalizeFactor = wnd.length / normalizeFactor;
        wndEnergyFactor = 0;
        for (int i=0; i<wnd.length; i++) {
            wnd[i] *= normalizeFactor;
            wndEnergyFactor += wnd[i]*wnd[i];
        }
        wndEnergyFactor = wnd.length / wndEnergyFactor;
    }

    private void init() {
        if (AnalyzerParameters.INSTANCE.getNFFTAverage() <= 0) {
            throw new IllegalArgumentException("STFT::init(): should minFeedSize >= 1.");
        }
        if (((-AnalyzerParameters.INSTANCE.getFftLen())&AnalyzerParameters.INSTANCE.getFftLen()) != AnalyzerParameters.INSTANCE.getFftLen()) {
            // error: fftlen should be power of 2
            throw new IllegalArgumentException("STFT::init(): Currently, only power of 2 are supported in fftlen");
        }
        sampleRate = AnalyzerParameters.INSTANCE.getSampleRate();
        fftLen = AnalyzerParameters.INSTANCE.getFftLen();
        hopLen = AnalyzerParameters.INSTANCE.getHopLen();                          // 50% overlap by default
        spectrumAmpOutCum= new double[AnalyzerParameters.INSTANCE.getFftLen()/2+1];
        spectrumAmpOutTmp= new double[AnalyzerParameters.INSTANCE.getFftLen()/2+1];
        spectrumAmpOut   = new double[AnalyzerParameters.INSTANCE.getFftLen()/2+1];
        spectrumAmpOutDB = new double[AnalyzerParameters.INSTANCE.getFftLen()/2+1];
        spectrumAmpIn    = new double[AnalyzerParameters.INSTANCE.getFftLen()];
        spectrumAmpInTmp = new double[AnalyzerParameters.INSTANCE.getFftLen()];
        spectrumAmpFFT   = new RealDoubleFFT(spectrumAmpIn.length);

        initWindowFunction(AnalyzerParameters.INSTANCE.getFftLen(), AnalyzerParameters.INSTANCE.getWndFuncName());
        initDBAFactor(AnalyzerParameters.INSTANCE.getFftLen(), sampleRate);
        clear();
        boolAWeighting = false;
    }

    STFT() {
        init();

        if (AnalyzerParameters.INSTANCE.getMicGainDB() != null) {
            if (micGain == null || micGain.length != AnalyzerParameters.INSTANCE.getMicGainDB().length) {
                micGain = new double[AnalyzerParameters.INSTANCE.getMicGainDB().length];
            }
            Log.w("STFT:", "calib loaded. micGain.length = " + micGain.length);
            for (int i = 0; i < micGain.length; i++) {
                micGain[i] = pow(10, AnalyzerParameters.INSTANCE.getMicGainDB()[i] / 10.0);
            }
        } else {
            Log.w("STFT:", "no calib");
        }
    }

    void feedData(short[] ds, int dsLen) {
        if (dsLen > ds.length) {
            Log.e("STFT", "dsLen > ds.length !");
            dsLen = ds.length;
        }
        int inLen = spectrumAmpIn.length;
        int outLen = spectrumAmpOut.length;
        int dsPt = 0;           // input data point to be read
        while (dsPt < dsLen) {
            while (spectrumAmpPt < 0 && dsPt < dsLen) {  // skip data when hopLen > fftLen
                double s = ds[dsPt++] / 32768.0;
                spectrumAmpPt++;
                cumRMS += s*s;
                cntRMS++;
            }
            while (spectrumAmpPt < inLen && dsPt < dsLen) {
                double s = ds[dsPt++] / 32768.0;
                spectrumAmpIn[spectrumAmpPt++] = s;
                cumRMS += s*s;
                cntRMS++;
            }
            if (spectrumAmpPt == inLen) {    // enough data for one FFT
                for (int i = 0; i < inLen; i++) {
                    spectrumAmpInTmp[i] = spectrumAmpIn[i] * wnd[i];
                }
                spectrumAmpFFT.ft(spectrumAmpInTmp);
                fftToAmp(spectrumAmpOutTmp, spectrumAmpInTmp);

                for (int i = 0; i < outLen; i++) {
                    spectrumAmpOutCum[i] += spectrumAmpOutTmp[i];
                }
                nAnalysed++;
                if (hopLen < fftLen) {
                    System.arraycopy(spectrumAmpIn, hopLen, spectrumAmpIn, 0, fftLen - hopLen);
                }
                spectrumAmpPt = fftLen - hopLen;  // can be positive and negative
            }
        }
    }

    // Convert complex amplitudes to absolute amplitudes.
    private void fftToAmp(double[] dataOut, double[] data) {
        // data.length should be a even number
        double scaler = 2.0*2.0 / (data.length * data.length);  // *2 since there are positive and negative frequency part
        dataOut[0] = data[0]*data[0] * scaler / 4.0;
        int j = 1;
        for (int i = 1; i < data.length - 1; i += 2, j++) {
            dataOut[j] = (data[i]*data[i] + data[i+1]*data[i+1]) * scaler;
        }
        dataOut[j] = data[data.length-1]*data[data.length-1] * scaler / 4.0;
    }

    private final double[] getSpectrumAmp() {
        if (nAnalysed != 0) {    // no new result
            int outLen = spectrumAmpOut.length;
            double[] sAOC = spectrumAmpOutCum;
            for (int j = 0; j < outLen; j++) {
                sAOC[j] /= nAnalysed;
            }
            if (micGain != null && micGain.length == sAOC.length) {
                // No correction to phase.
                // Correction to DC is fake.
                for (int j = 0; j < outLen; j++) {
                    sAOC[j] /= micGain[j];
                }
            }
            if (boolAWeighting) {
                for (int j = 0; j < outLen; j++) {
                    sAOC[j] *= dBAFactor[j];
                }
            }
            System.arraycopy(sAOC, 0, spectrumAmpOut, 0, outLen);
            Arrays.fill(sAOC, 0.0);
            nAnalysed = 0;
            for (int i = 0; i < outLen; i++) {
                spectrumAmpOutDB[i] = 10.0 * log10(spectrumAmpOut[i]);
            }
        }
        return spectrumAmpOut;
    }

    private final double[] getSpectrumAmpDB() {
        getSpectrumAmp();
        return spectrumAmpOutDB;
    }

    int nElemSpectrumAmp() {
        return nAnalysed;
    }

    double maxAmpFreq = Double.NaN, maxAmpDB = Double.NaN;

    void calculatePeak() {
        getSpectrumAmpDB();

        // Find and show peak amplitude
        maxAmpDB  = 20 * log10(0.125/32768);
        maxAmpFreq = 0;

        //BAND PASS FILTER
        for (int i = AnalyzerParameters.INSTANCE.getMinimumFrequencySpectral(); i < AnalyzerParameters.INSTANCE.getMaximumFrequencySpectral(); i++) {

            if (spectrumAmpOutDB[i] > maxAmpDB) {       //if higher value
                maxAmpDB = spectrumAmpOutDB[i];         //update maxAmpDB
                maxAmpFreq = i;                         //band i = new peak

                //CALCULATE AVERAGE OF 20 BARS AROUND THIS FREQUENCY
                if (maxAmpFreq > AnalyzerParameters.INSTANCE.getMinimumFrequencySpectral() + ((double)bandpassWidth/2) && maxAmpFreq < AnalyzerParameters.INSTANCE.getMaximumFrequencySpectral() - ((double)bandpassWidth/2)) {                   //if within range of array
                    totalDB = 0;
                    for (int j = (int) maxAmpFreq - (bandpassWidth/2); j < maxAmpFreq + ((double)bandpassWidth/2); j++) {     //for peak - 25 to peak + 25
                        readingsDB[j] = (int) spectrumAmpOutDB[j];                      // reading[j] = decibels from j
                        totalDB = totalDB + readingsDB[j];                              //add reading to total
                    }
                }
                //find next peak
            }

        }

        averageDB = totalDB / bandpassWidth;
     //   System.out.println("PEAK DB: " + maxAmpFreq + ";" + maxAmpDB + "  AverageDB = " + averageDB);

        maxAmpFreq = maxAmpFreq * AnalyzerParameters.INSTANCE.getHzPerSpectral();


        // Slightly better peak finder
        // The peak around spectrumDB should look like quadratic curve after good window function
        // a*x^2 + b*x + c = y
        // a - b + c = x1
        //         c = x2
        // a + b + c = x3
        if (AnalyzerParameters.INSTANCE.getHzPerSpectral() < maxAmpFreq && maxAmpFreq < (double) AnalyzerParameters.INSTANCE.getSampleRate()/2 - AnalyzerParameters.INSTANCE.getHzPerSpectral()) {
            int id = (int)(round(maxAmpFreq/sampleRate*fftLen));
            double x1 = spectrumAmpOutDB[id-1];
            double x2 = spectrumAmpOutDB[id];
            double x3 = spectrumAmpOutDB[id+1];
            double c = x2;
            double a = (x3+x1)/2 - x2;
            double b = (x3-x1)/2;
            if (a < 0) {
                double xPeak = -b/(2*a);
                if (abs(xPeak) < 1) {
                    maxAmpFreq += xPeak * AnalyzerParameters.INSTANCE.getHzPerSpectral();
                    maxAmpDB = (4*a*c - b*b)/(4*a);
                }
            }
        }

    }

    private void clear() {
        spectrumAmpPt = 0;
        Arrays.fill(spectrumAmpOut, 0.0);
        Arrays.fill(spectrumAmpOutDB, log10(0));
        Arrays.fill(spectrumAmpOutCum, 0.0);
    }

}
