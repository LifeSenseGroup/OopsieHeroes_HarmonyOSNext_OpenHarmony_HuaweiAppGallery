import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.os.Build
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.lifesensegroup.oopsieheroes.MainActivity
import com.lifesensegroup.oopsieheroes.R
import com.lifesensegroup.oopsieheroes.notificationsManager.MyNotification
import com.lifesensegroup.oopsieheroes.notificationsManager.MyNotificationChannel
//import com.lifesensegroup.oopsieheroes.util.Utils

class NotificationsManager(private val applicationContext: Context) {
    private val openAppRequestCode = 1
    private val notificationManager: NotificationManager =
        applicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun sendAlarmNotification(title: String, text: String?, channelName: String, channelDescription: String?, color: String?) {
        val parsedColor = Utils(applicationContext).parseColor(color)
        createAlarmNotificationChannel(channelName, channelDescription ?: "")

        val builder = NotificationCompat.Builder(applicationContext, MyNotificationChannel.Alarm.name)
            .setSmallIcon(R.drawable.notification_icon)
            .setLargeIcon(BitmapFactory.decodeResource(applicationContext.resources, R.drawable.icon_rounded))
            .setColor(parsedColor)
            .setContentTitle(title)
            .setContentText(text)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setContentIntent(getOpenAppIntent())
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)

        with(NotificationManagerCompat.from(applicationContext)) {
            if (ActivityCompat.checkSelfPermission(
                    applicationContext,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
                return
            }
            notify(MyNotification.Alarm.id, builder.build())
        }
    }

    fun cancelNotification(id: String) {
        MyNotification.with(id)?.let {
            notificationManager.cancel(it.id)
        }
    }

    private fun createAlarmNotificationChannel(channelName: String, channelDescription: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelName, channelName, NotificationManager.IMPORTANCE_DEFAULT).apply {
                description = channelDescription
                importance = NotificationManager.IMPORTANCE_HIGH
                setShowBadge(false)
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun getOpenAppIntent(): PendingIntent {
        val intent = Intent(applicationContext, MainActivity::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return PendingIntent.getActivity(applicationContext, openAppRequestCode,
                intent, PendingIntent.FLAG_IMMUTABLE)
        } else {
            return PendingIntent.getActivity(applicationContext, openAppRequestCode,
                intent, 0)
        }
    }
}
