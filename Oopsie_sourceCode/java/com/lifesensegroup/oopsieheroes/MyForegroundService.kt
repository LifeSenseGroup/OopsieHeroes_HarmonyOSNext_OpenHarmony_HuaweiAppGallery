package com.lifesensegroup.oopsieheroes
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.lifesensegroup.oopsieheroes.FreqAnalyzerManager


class MyForegroundService: Service() {

    override fun onCreate() {
        super.onCreate()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val openAppRequestCode = 1


        val input = intent?.getStringExtra("ok")

        val notificationIntent = Intent(this, MainActivity::class.java)

        val pendingIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE)
        } else {
            PendingIntent.getActivity(this, 0, notificationIntent, 0)
        }


        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel("1", "Channel Name", NotificationManager.IMPORTANCE_DEFAULT)
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, "1")
            .setContentTitle("oopsieheroes")
            .setContentText(input)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingIntent)
            .build()

        startForeground(1, notification)


        FreqAnalyzerManager.initialize(applicationContext)
        FreqAnalyzerManager.startMonitoring()



        return START_NOT_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        // Stop FreqAnalyzerManager
        FreqAnalyzerManager.stopMonitoring()

        // Remove the ongoing notification
        stopForeground(true)
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(1) // ID used while creating the notification in onStartCommand

    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}