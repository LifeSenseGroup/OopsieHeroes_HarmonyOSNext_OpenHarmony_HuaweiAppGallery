import android.app.ActivityManager
import android.content.Context.ACTIVITY_SERVICE
import android.graphics.Color
import android.util.Log
import android.content.Context  // Import the Android Context class

class Utils(private val context: Context) {  // Use the Android Context class

    fun parseColor(hex: String?): Int {
        val default = Color.DKGRAY  // Use the Android Color class
        return hex?.takeIf { it.isNotBlank() }?.let { string ->
            try {
                Color.parseColor(string)
            } catch (e: IllegalArgumentException) {
                Log.e("Parsing color", "Failed")
                default
            }
        } ?: default
    }

    @Suppress("DEPRECATION")
    fun <T> isServiceRunning(service: Class<T>): Boolean {
        return (context.getSystemService(ACTIVITY_SERVICE) as ActivityManager)
            .getRunningServices(Integer.MAX_VALUE)
            .any { it.service.className == service.name }
    }
}
