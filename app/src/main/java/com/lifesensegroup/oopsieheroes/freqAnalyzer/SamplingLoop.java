package com.lifesensegroup.oopsieheroes;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.net.rtp.AudioStream;
import android.os.SystemClock;
import android.util.Log;
import com.lifesensegroup.oopsieheroes.R;
import com.lifesensegroup.oopsieheroes.STFT;

import android.media.MediaPlayer;



import android.media.MediaPlayer;
import java.util.Arrays;

import static java.lang.Math.floor;

public class SamplingLoop extends Thread {
    private final String TAG = "SamplingLoop";
    private volatile boolean isRunning = true;
    private volatile boolean isPaused1 = false;
    private STFT stft;   // use with care
    private final FreqAnalyzerManager activity;


    private int [] peakBuffer = new int[2048];  // note fft is probably only half of it.

    // 0=begin, 1=first 2sec detected , 2= 2sec on 2 sec off detected, 3 = full cycle detected, peak is on again
    private int  detection4khzState = 0;
    private int  nrPeaksAt4khz = 0;
    private double peakthresholdAgainstAverage = 3.0;      // signal must be x times avg then it is a peak
    private int nrOfTimesPeakDetectedBeforeAlarm = 24*4;  // about 3 seconds
    private int [] maxPieks = new int[nrOfTimesPeakDetectedBeforeAlarm];
    private int maxPieksIndex = 0;
    private boolean firstPeakDetected = false;
    private int zeropeakcnt = 0;
    private boolean oopsieDetected = false;
    private boolean alarmTriggered = false;
    private int first2secdetectedCnt = 0;
    private int avgWindowLenght = 20; // must be even number
    private int arrayCnt = 0;

    private int loopsPerSeconds = 24;
    private int margin = 14;  // false detection margin more then 10 is probably a peak
    private int bin4khz = 0;

    private void testfind_peaks()
    {
        int start = 5;
        int stopit  = 15;
        double[] buffer = {0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21};
        double avg = 3.5;
        avgWindowLenght = 10;
        find_peaks(buffer, start, stopit, avg); // test local average with debugger, should be 5,6,7,8,9,10,11,12,13,14,15
        double[] buffer2 = {5,5,5,5,5,5,5,5,5,5,5,5,2,2,2,2,2,2,2,2,2,2,2,2}; // 2 avg levels of 5 and 2
        stopit  = 19; // make sure it is avgWindowLength/2 +1 position away from the last value of 5
        buffer2[6] = 5*peakthresholdAgainstAverage + 1;
        buffer2[18]  = 2*peakthresholdAgainstAverage + 1;
        find_peaks(buffer2, start, stopit, avg);
        for (int x = 1; x < 22; x++)
        {
            switch(x)
            {
                case 6:
                case 18:
                    if (peakBuffer[x] != 1)
                        Log.d(TAG,"test error");
                    break;
                default:
                    if (peakBuffer[x] != 0)
                        Log.d(TAG, "test error");
                    break;
            }
        }

    }

    SamplingLoop(FreqAnalyzerManager activity) {
        this.activity = activity;
    }

    private void SleepWithoutInterrupt(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private double[] mdata;

    // Generate test data.
    private int readTestData(short[] a, int offsetInShorts, int sizeInShorts, int id) {
        if (mdata == null || mdata.length != sizeInShorts) {
            mdata = new double[sizeInShorts];
        }
        Arrays.fill(mdata, 0.0);
        return sizeInShorts;
    }

    private double  average(double[] buffer, double start, double stop) {
        double total = 0;

        for (int i = (int) floor(start);  i < (int)floor(stop); i++) {
            total += buffer[i];
        }

        return (total / (stop - start));
    };
    private void find_peaks( double[] buffer, int start, int stop, double avg)
    {
        double sum = 0.0;
        int x = 0;
        double localAvg = 0.0;
        double localPiek = 0.0;
        double threshold = 1.4;
        double curMaxPiekAmp = 0.0;
        int curMaxPiekIndex = 0;


        // make sure avgWindowLengt can be divided by 2!!

        // first set an average at the start position
        for ( x = start-(avgWindowLenght/2); x <= Math.floor(start)+(avgWindowLenght/2) ; x++)
        {
            sum = sum + buffer[x];
        }
        localPiek = buffer[start-1] + buffer[start] + buffer[start+1];
        sum = sum - localPiek; // remove piek value from average, so remove from sum
        localAvg = sum/(avgWindowLenght-2); // make sure avgWindowLenhgt can be divided by 2!!, with the current element it should have been avgWlength + 1
        sum = sum + localPiek; // add local piek again to sum, not to average
        x = start; // begin at start again (in the middle of our averag window)
        for (int i = start; i < stop; i++) {

            if (((i-bin4khz) > -3) && ((i-bin4khz) < 3))
                threshold = 1.2; // smaller threshold for 4khz detection
            else
                threshold = 1.4;
            // increase threshold with 2 because we use now 3 bins for the peak
            if ((localPiek > localAvg*peakthresholdAgainstAverage*threshold) ) // also check if local avg is not to noisy
            {

                peakBuffer[i] = peakBuffer[i] + 1;
            }
            else
            {
               // if (localAvg < avg*2)
               //   Log.d(TAG," localAvg too high " );
                peakBuffer[i] = 0;
            }
            // remove old value from average sum
            sum = sum - buffer[x- (avgWindowLenght/2)];  // TODO: use approxRollingAverage
            x++;
            sum = sum + buffer[x+ (avgWindowLenght/2)];  //  add new value to average sum

            localPiek = buffer[x-1] + buffer[x] + buffer[x+1];
            sum = sum - localPiek; // remove localpiek from sum and so also from average
            localAvg = sum/(avgWindowLenght-2); // calculate avg again, without peaks so -3 + 1 for bin itself
            sum = sum + localPiek; // add local piek again to sum

            if (localPiek > curMaxPiekAmp) {
                curMaxPiekAmp = localPiek;
                curMaxPiekIndex = i;
            }
        }
        peakBuffer[0] = peakBuffer[0]  + 1;  // just to see how many cycle we have in total
        maxPieks[maxPieksIndex] = curMaxPiekIndex;

        maxPieksIndex++;
        if (maxPieksIndex >= nrOfTimesPeakDetectedBeforeAlarm )
            maxPieksIndex = 0;

    }

    // 0=begin, 1=first 2sec detected , 2= 2sec on 2 sec off detected, 3 = full cycle detected, peak is on again

    private void resetVars()
    {
        first2secdetectedCnt = 0;
        detection4khzState = 0;
        firstPeakDetected = false;
        Log.d(TAG,"reset var !" + arrayCnt);
    }

    private void fill4khzPeak(){

        if ((peakBuffer[bin4khz-1] > 0) || (peakBuffer[bin4khz]>0) || (peakBuffer[bin4khz+1]>0)) // if any of them is not resetted
      //  if (peakBuffer[bin]>0)
        {
            nrPeaksAt4khz = nrPeaksAt4khz + 1;
            if (nrPeaksAt4khz > 4)
               Log.d(TAG,"4khz peak, cnt : " + nrPeaksAt4khz );
        }
        else
        {
            nrPeaksAt4khz = 0;
        }

    }

    private boolean check_piek_is_50_percent_max(int binNr)
    {
        int loopcnt = 0;
        int cnt = 0;
        boolean retVal = false;
        /* max piek should be at least 50% this peak */
        while (loopcnt < nrOfTimesPeakDetectedBeforeAlarm)
        {
            if (maxPieks[loopcnt] == binNr-1 || maxPieks[loopcnt] == binNr ||
                    maxPieks[loopcnt] == binNr+1) {
                cnt++;
            }
            loopcnt++;
        }
        Log.d(TAG,"max cnt =  " + cnt );
        if (cnt > (nrOfTimesPeakDetectedBeforeAlarm/2)) {
            retVal = true;
        }
       return retVal;
    }

    private void check_peak_at_4khz() {

        fill4khzPeak();
        switch (detection4khzState) {
            case 0: // begin
                if (nrPeaksAt4khz > loopsPerSeconds - 2) // if peak detected for 1 seconds
                {
                    detection4khzState = detection4khzState + 1; // the first 2 seconds are detected, check 2 sec silents
                }

                break;

            case 1:

                first2secdetectedCnt = first2secdetectedCnt + 1;
                if (nrPeaksAt4khz == 0)
                {
                    // 2e piek detected
                    firstPeakDetected = true;
                }

                if ((nrPeaksAt4khz > (loopsPerSeconds - 2)) &&  firstPeakDetected) {

                    detection4khzState = detection4khzState + 1;
                    Log.d(TAG,"2e piek detected with a silence inbetween" );
                }

                if (first2secdetectedCnt > (loopsPerSeconds*4))
                {
                      Log.d(TAG,"reset var,  " + firstPeakDetected );
                      resetVars();
                }
                break;

            case 2:

                first2secdetectedCnt = first2secdetectedCnt + 1; // TODO: use different variable with diff name
                if (nrPeaksAt4khz == 0)
                {
                    // 2e silence so signal is OK
                    if (check_piek_is_50_percent_max(bin4khz))
                        oopsieDetected = true; // alarm on
                    else{
                        Log.d(TAG,"reset var no 50% max piek  "  );
                        resetVars();
                    }
                }

                if (first2secdetectedCnt > (loopsPerSeconds*5))
                {
                    Log.d(TAG,"reset var no 2e silence  "  );
                    resetVars();
                }
                break;
        }
    }

    @Override
    public void run() {
        AudioRecord record;
        oopsieDetected = false;
        alarmTriggered = false;

        double binSize = AnalyzerParameters.INSTANCE.getHzPerSpectral();

        bin4khz = (int)Math.floor(4096.0 / binSize);


        long tStart = SystemClock.uptimeMillis();

        long tEnd = SystemClock.uptimeMillis();
        if (tEnd - tStart < 500) {
            Log.i(TAG, "wait more.." + (500 - (tEnd - tStart)) + " ms");
            // Wait until previous instance of AudioRecord fully released.
            SleepWithoutInterrupt(500 - (tEnd - tStart));
        }

        int minBytes = AudioRecord.getMinBufferSize((int)AnalyzerParameters.INSTANCE.getSampleRate(), AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT);
        if (minBytes == AudioRecord.ERROR_BAD_VALUE) {
            Log.e(TAG, "SamplingLoop::run(): Invalid AudioRecord parameter.\n");
            return;
        }

        /*
          Develop -> Reference -> AudioRecord
             Data should be read from the audio hardware in chunks of sizes
             inferior to the total recording buffer size.
         */
        // Determine size of buffers for AudioRecord and AudioRecord::read()
        int readChunkSize    = AnalyzerParameters.INSTANCE.getHopLen();  // Every hopLen one fft result (overlapped analyze window)
        readChunkSize        = Math.min(readChunkSize, 2048);  // read in a smaller chunk, hopefully smaller delay
        int bufferSampleSize = Math.max(minBytes / AnalyzerParameters.INSTANCE.getBYTE_OF_SAMPLE(), AnalyzerParameters.INSTANCE.getFftLen()/2) * 2;
        // tolerate up to about 1 sec.
        bufferSampleSize = (int)Math.ceil(1.0 * AnalyzerParameters.INSTANCE.getSampleRate() / bufferSampleSize) * bufferSampleSize;



        // Use the mic with AGC turned off. e.g. VOICE_RECOGNITION for measurement
        // The buffer size here seems not relate to the delay.
        // So choose a larger size (~1sec) so that overrun is unlikely.
        try {
            if (AnalyzerParameters.INSTANCE.getAudioSourceId() < 1000) {
                record = new AudioRecord(AnalyzerParameters.INSTANCE.getAudioSourceId(), AnalyzerParameters.INSTANCE.getSampleRate(), AudioFormat.CHANNEL_IN_MONO,
                        AudioFormat.ENCODING_PCM_16BIT, AnalyzerParameters.INSTANCE.getBYTE_OF_SAMPLE() * bufferSampleSize);
            } else {
                record = new AudioRecord(AnalyzerParameters.INSTANCE.getRECORDER_AGC_OFF(), AnalyzerParameters.INSTANCE.getSampleRate(), AudioFormat.CHANNEL_IN_MONO,
                        AudioFormat.ENCODING_PCM_16BIT, AnalyzerParameters.INSTANCE.getBYTE_OF_SAMPLE() * bufferSampleSize);
            }
        } catch (IllegalArgumentException e) {
            Log.e(TAG, "Fail to initialize recorder.");
            return;
        }

        short[] audioSamples = new short[readChunkSize];
        int numOfReadShort;

        stft = new STFT();

        // Start recording
        try {
            record.startRecording();
        } catch (IllegalStateException e) {
            Log.e(TAG, "Fail to start recording.");
            return;
        }

        // Main loop
        //        // When running in this loop (including when paused), you can not change properties
        // related to recorder: e.g. audioSourceId, sampleRate, bufferSampleSize
        // TODO: allow change of FFT length on the fly.
        while (isRunning) {
            // Read data
            if (AnalyzerParameters.INSTANCE.getAudioSourceId() >= 1000) {
                numOfReadShort = readTestData(audioSamples, 0, readChunkSize, AnalyzerParameters.INSTANCE.getAudioSourceId());
            } else {
                numOfReadShort = record.read(audioSamples, 0, readChunkSize);   // pulling
            }

            if (isPaused1) {
                // keep reading data, for overrun checker and for write wav data
                continue;
            }


            stft.feedData(audioSamples, numOfReadShort);
          //  Log.d(TAG, " nElements in fft" + stft.nElemSpectrumAmp());
            // If there is new spectrum data, do plot
            if (stft.nElemSpectrumAmp() >= AnalyzerParameters.INSTANCE.getNFFTAverage()) {

                tStart = SystemClock.uptimeMillis();
           //     Log.d(TAG," duration = " + (tStart - tEnd));
                tEnd = SystemClock.uptimeMillis();
                stft.calculatePeak();

                int test = AnalyzerParameters.INSTANCE.getMinimumFrequencySpectral();
                test = AnalyzerParameters.INSTANCE.getMaximumFrequencySpectral();

                double avg = average(
                        stft.spectrumAmpOut,
                        AnalyzerParameters.INSTANCE.getMinimumFrequencySpectral(),
                        AnalyzerParameters.INSTANCE.getMaximumFrequencySpectral()
                );

                find_peaks(
                        stft.spectrumAmpOut,
                        AnalyzerParameters.INSTANCE.getMinimumFrequencySpectral(),
                        AnalyzerParameters.INSTANCE.getMaximumFrequencySpectral(),
                        avg);

                if (nrPeaksAt4khz > 16)
                    Log.i(TAG,"nrPeaksAt4khz : " + nrPeaksAt4khz);
                if (zeropeakcnt > 14)
                    Log.i(TAG,"nrZeroAt4khz : " + zeropeakcnt);

                check_peak_at_4khz(); // can also trigger oopsie alarm (variable oopsieDetected)

                if (!"plus".equals(AnalyzerParameters.INSTANCE.getSensorType())) {
                    int maxPiek = 0;
                    int maxPiekBin = 0;
                    for (int i = 1; i < 1024; i++) {
                        int peak = peakBuffer[i];
                        if (peak > maxPiek) {
                            maxPiek = peak;
                            maxPiekBin = i;
                        }

                        if (peak > nrOfTimesPeakDetectedBeforeAlarm) {
                                if (!"plus".equals(AnalyzerParameters.INSTANCE.getSensorType())) {

                                    if (check_piek_is_50_percent_max(i)) {
                                        oopsieDetected = true;
                                        Log.i(TAG, "oopsie Detected bin : " + i + " freq :" + (i * AnalyzerParameters.INSTANCE.getHzPerSpectral()));
                                    }
                                    else
                                    {
                                        Log.i(TAG, "no 50% max piek " );
                                    }
                                }

                        }
                    }
                    if (maxPiek > 40)
                        Log.i(TAG,"max peak detected :" + maxPiek + " binnr :" + maxPiekBin);

                }

                if ((oopsieDetected == true) && (alarmTriggered == false))
                {

                  //  var mediaPlayer = MediaPlayer.create(this.activity, R.raw.alarmsound1);
                  //  mediaPlayer.start();

           /*         File audioFile = new File(R.raw.alarmsound2);
                    AudioInputStream audioStream = AudioStream.getAudioInputStream(audioFile);
                    AudioFormat format = audioStream.getFormat();
                    Dataline.Info info = new DataLine.Info(Clip.class,format);
                    Clip audioclip = (Clip) AudioSystem.getLine(info);
                    audioClip.open(audioStream);
                    audioClip.start();       */
                    Log.d(TAG,"SEND TRIGGER !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

                    activity.sendTrigger(true);
                    alarmTriggered = true;
                  //  activity.stopMonitoring();   // is done in the JS part !?
                }
            }

        }
        Log.i(TAG, "SamplingLoop::Run(): Stopping and releasing recorder.");
        record.stop();
        record.release();
    }


    boolean getPause() {
        return this.isPaused1;
    }

    void finish() {
        isRunning = false;
        interrupt();
    }
}
