package com.lifesensegroup.oopsieheroes

import android.media.MediaRecorder

object AnalyzerParameters {

    val RECORDER_AGC_OFF = MediaRecorder.AudioSource.VOICE_RECOGNITION
    var audioSourceId = RECORDER_AGC_OFF
    var sampleRate = 44100
    var fftLen = 2048
    var hopLen = 1024
    var wndFuncName: String? = null
    var nFFTAverage = 2
    val BYTE_OF_SAMPLE = 2
    var micGainDB: Array<Double>? = null
    val hzPerSpectral: Double
      get() = sampleRate.toDouble() / fftLen.toDouble()
    var minimumFrequency = 3800.0
    var maximumFrequency = 4300.0
    val minimumFrequencySpectral: Int
        get() = (minimumFrequency / hzPerSpectral).toInt()
    val maximumFrequencySpectral: Int
        get() = (maximumFrequency / hzPerSpectral).toInt()
    var sensorType: String? = null
}