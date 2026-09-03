import android.app.*
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.util.Log
import com.lifesensegroup.oopsieheroes.FreqAnalyzerManager
import com.lifesensegroup.oopsieheroes.notificationsManager.MyNotification


class SoundDetectionService : Service() {

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("MyService", "onStartCommand called")
        super.onStartCommand(intent, flags, startId)

        // Replace with your desired logic here

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create a notification for the service (optional)
        val notification = Notification.Builder(this)
            .setContentTitle("Sound Service Running")
            .setContentText("Your service is running in the background.")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .build()

        startForeground(MyNotification.SensorDetectionForegroundService.id, notification)

        // Start your background logic here
       // FreqAnalyzerManager.getInstance(this).startMonitoring()

        return START_STICKY
    }


}
