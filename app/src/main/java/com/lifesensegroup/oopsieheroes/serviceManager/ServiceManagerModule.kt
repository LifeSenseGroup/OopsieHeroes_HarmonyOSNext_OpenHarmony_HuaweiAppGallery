package com.lifesensegroup.oopsieheroes.serviceManager

import SoundDetectionService
import Utils
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import com.lifesensegroup.oopsieheroes.AnalyzerParameters
import com.lifesensegroup.oopsieheroes.util.SingletonHolder
//import com.lifesensegroup.oopsieheroes.notificationsManager.NotificationsManagerModule
//import com.lifesensegroup.oopsieheroes.util.SingletonHolder
//import com.lifesensegroup.oopsieheroes.util.Utils

class ServiceManagerModule private constructor(private val context: Context) {

    companion object : SingletonHolder<ServiceManagerModule, Context>(::ServiceManagerModule)

    fun getName() = "ServiceManager"

    private var countDown: CountDownTimer? = null

    fun startMonitoringService(
        channelName: String,
        channelDescription: String,
        notifTitle: String,
        notifText: String,
        notifColorString: String,
        minNightMillis: Int,
        frequencyLowerLimit: Double,
        frequencyUpperLimit: Double,
        sensorType: String?
    ) {

        AnalyzerParameters.sensorType = sensorType

        AnalyzerParameters.minimumFrequency = frequencyLowerLimit
        AnalyzerParameters.maximumFrequency = frequencyUpperLimit

        if (!Utils(context).isServiceRunning(SoundDetectionService::class.java)) {

            if (android.os.Build.VERSION.SDK_INT >= 26) {
            //    NotificationsManagerModule.getInstance(context).createSoundDetectionNotificationChannel(channelName, channelDescription)
            //    NotificationsManagerModule.getInstance(context).setNotificationForSoundDetectionService(notifTitle, notifText, notifColorString)
                context.startForegroundService(Intent(context, SoundDetectionService::class.java))
            } else {
                context.startService(Intent(context, SoundDetectionService::class.java))
            }
        }
    }






}
