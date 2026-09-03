package com.lifesensegroup.oopsieheroes

//import com.lifesensegroup.oopsieheroes.serviceManager.SoundDetectionService
//import com.lifesensegroup.oopsieheroes.serviceManager.TriggerAlarmService
//import com.lifesensegroup.oopsieheroes.util.SingletonHolder

import android.content.Context
import android.content.Intent
import android.util.Log
import com.lifesensegroup.oopsieheroes.audioManager.AudioManagerModule
import com.lifesensegroup.oopsieheroes.SamplingLoop
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

fun createTriggerFlow(): Flow<Boolean> = flow {
    emit(true) // Emit the "FrequencyTriggered" event with the "triggered" value
}

interface TriggerCallback {
    fun onTriggerReceived(triggered: Boolean)
}

object FreqAnalyzerManager {

    private var triggerCallback: TriggerCallback? = null

    private var TAG: String = "Oopsie"
    private var applicationContext: Context? = null
    private var samplingThread: SamplingLoop? = null

    fun setTriggerCallback(callback: TriggerCallback) {
        this.triggerCallback = callback
    }

    fun initialize(context: Context) {
        applicationContext = context
    }

    fun getName() = "FreqAnalyzer"

    fun startMonitoring() {
        restartSampling()
    }

    fun stopPlaying() {
        applicationContext?.let { AudioManagerModule.getInstance(it).stopPlayAudio() }
    }

    fun stopMonitoring() {
        // applicationContext.stopService(Intent(applicationContext, SoundDetectionService::class.java))
        samplingThread?.finish()
    }

    private fun restartSampling() {
        // Stop previous sampler if any.
        samplingThread?.let {
            it.finish()
            try {
                it.join()
            } catch (e: InterruptedException) {
                e.printStackTrace()
            }
            samplingThread = null
        }

        samplingThread = SamplingLoop(this)
        samplingThread?.start()
    }

    fun sendTrigger(triggered: Boolean) {
        applicationContext?.let { context ->
            Log.i(TAG, "alarm")
            Log.d(TAG, "alarm on send trigger")
            AudioManagerModule.getInstance(context).setMinAlarmVolumeLevel(0.8)
            AudioManagerModule.getInstance(context).playAudio(false)
            AudioManagerModule.getInstance(context).playVibrate(false)
            // AudioManagerModule.getInstance()
            // Start your MainActivity from here
         //   val mainActivityIntent = Intent(context, MainActivity::class.java)
         //   mainActivityIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
         //   mainActivityIntent.putExtra("triggered", triggered)
        //    context.startActivity(mainActivityIntent)

            // Call the callback to notify the MainActivity
            triggerCallback?.onTriggerReceived(triggered)
           // createTriggerFlow()

        }
    }
}
