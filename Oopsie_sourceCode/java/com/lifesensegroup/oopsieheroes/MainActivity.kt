package com.lifesensegroup.oopsieheroes

import SoundDetectionService
import android.content.Intent
import android.content.pm.PackageManager
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.provider.SyncStateContract
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.lifesensegroup.oopsieheroes.R
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject
import java.util.Date
import com.lifesensegroup.oopsieheroes.audioManager.AudioManagerModule
import com.lifesensegroup.oopsieheroes.TriggerCallback
import com.lifesensegroup.oopsieheroes.serviceManager.ServiceManagerModule
import android.Manifest
import android.app.AlarmManager
import android.app.PendingIntent
import android.util.Log
import android.webkit.*
import androidx.core.view.ViewCompat
import java.lang.reflect.Type
import android.content.Context
import android.os.Vibrator
import android.view.View
import android.widget.Button
import android.os.VibrationEffect
import android.os.Build


class MainActivity : AppCompatActivity(), TriggerCallback {


    /** Instantiate the interface  */
    class WebAppInterface(private val webAct: MainActivity) {

        /** get a value from the website  */
        @JavascriptInterface
        fun setActivities(txt: String)
        {
            webAct.setterFromWebview(txt);
        }
    }

    private lateinit var webView: WebView;


    private fun SendTrigger() {
        runOnUiThread {
            webView.evaluateJavascript("AlarmTriggered()") { result ->
                Log.d("LogName", result ?: "null")
                // After the JavaScript function is called, play alarm sound and trigger vibration
                playAlarmWithVibration()
            }
        }
    }

    private fun playAlarmWithVibration() {
        // Trigger vibration
        val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        // val vibrationDuration = 17000 // 17 seconds in milliseconds
        val vibrationDuration = 600000  //10 minutes in miliseconds1997
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(vibrationDuration.toLong(), VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            // Deprecated in API 26
            vibrator.vibrate(vibrationDuration.toLong())
        }
    }

    override fun onTriggerReceived(triggered: Boolean) {

        if (triggered) {
            
            SendTrigger();
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        WindowCompat.setDecorFitsSystemWindows(window, false)


        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webview)

        // Setup asset loader to handle local asset paths
        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build();

        // Override WebView client, and if request is to local file, intercept and serve local
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url);
            }
        }

        val webViewSettings = webView.settings
        // Setting this off for security. Off by default for SDK versions >= 16.
        // Setting this off for security. Off by default for SDK versions >= 16.
        webViewSettings.allowFileAccessFromFileURLs = false
        // Off by default, deprecated for SDK versions >= 30.
        // Off by default, deprecated for SDK versions >= 30.
        webViewSettings.allowUniversalAccessFromFileURLs = false
        // Keeping these off is less critical but still a good idea, especially if your app is not
        // using file:// or content:// URLs.
        // Keeping these off is less critical but still a good idea, especially if your app is not
        // using file:// or content:// URLs.
        webViewSettings.allowFileAccess = false
        webViewSettings.allowContentAccess = false
        webViewSettings.javaScriptEnabled = true
        webViewSettings.domStorageEnabled = true


        /* JavaScriptInterface class is created to define methods that can be called from JavaScript. The second parameter ("Android") specifies the name by which these methods can be accessed from JavaScript. */
        webView.addJavascriptInterface(MainActivity.WebAppInterface(this),"Android");

        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")

        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED && ContextCompat.checkSelfPermission(this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            val permissions = arrayOf(android.Manifest.permission.RECORD_AUDIO, android.Manifest.permission.WRITE_EXTERNAL_STORAGE, android.Manifest.permission.READ_EXTERNAL_STORAGE)
            ActivityCompat.requestPermissions(this, permissions,0)
        }



    }

    fun startSoundDetection()
    {
        // Obtain an instance of AudioManagerModule
        val audioManagerModule = AudioManagerModule.getInstance(this)

        //stopSoundDetection();

        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED && ContextCompat.checkSelfPermission(this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            val permissions = arrayOf(android.Manifest.permission.RECORD_AUDIO, android.Manifest.permission.WRITE_EXTERNAL_STORAGE, android.Manifest.permission.READ_EXTERNAL_STORAGE)
            ActivityCompat.requestPermissions(this, permissions,0)
        }

        val input = "oopsieheroes"

        val myServiceIntent = Intent(this, MyForegroundService::class.java)


        myServiceIntent.putExtra("sounddetection", input)
        ContextCompat.startForegroundService(this, myServiceIntent)

        // Set the trigger callback to this activity
        val service = FreqAnalyzerManager
        service.setTriggerCallback(this)
    }




        fun stopSoundDetection() {
            val myServiceIntent = Intent(this, MyForegroundService::class.java)
            stopService(myServiceIntent)

            val pendingIntent = PendingIntent.getService(this, 0, myServiceIntent, 0)
            val alarmManager = getSystemService(ALARM_SERVICE) as AlarmManager
            alarmManager.cancel(pendingIntent)
        }




    fun setterFromWebview(txt: String) {
        System.out.println("web  callback  : $txt");

        try {
            val obj = JSONObject(txt)
            val action = obj.getString("text")
            val value = obj.getString("value")
            System.out.println("Action : $action");

            if (action == "START")
            {
                startSoundDetection();
            }

            if (action == "STOP")
            {
                stopSoundDetection();
            }

            if (action == "SETSNDFILE")
            {
                // Replace "selected_alarm_sound.mp3" with the appropriate file name
                val selectedFileName = value
                AudioManagerModule.getInstance(this).setSndFile(selectedFileName)
                //AudioManagerModule.getInstance(this).setSndFile(value)
            }

            if (action == "SETVIBRATE") {
                val intValue = value.toIntOrNull() ?: 0 // Convert the value to Int, defaulting to 0 if conversion fails
                AudioManagerModule.getInstance(this).setVibrate(intValue)
            }

            if (action == "SND1")
            {
                AudioManagerModule.getInstance(this).setSndFile("alarmsound1.mp3")
                AudioManagerModule.getInstance(this).playAudio(true)
                AudioManagerModule.getInstance(this).playVibrate(true)
            }
            if (action == "SND2")
            {
                AudioManagerModule.getInstance(this).setSndFile("alarmsound2.mp3")
                AudioManagerModule.getInstance(this).playAudio(true)
                AudioManagerModule.getInstance(this).playVibrate(true)
            }
            if (action == "SND3")
            {
                AudioManagerModule.getInstance(this).setSndFile("alarmsound3.mp3")
                AudioManagerModule.getInstance(this).playAudio(true)
                AudioManagerModule.getInstance(this).playVibrate(true)
            }
            if (action == "SND4")
            {
                AudioManagerModule.getInstance(this).setSndFile("alarmsound4.mp3")
                AudioManagerModule.getInstance(this).playAudio(true)
                AudioManagerModule.getInstance(this).playVibrate(true)
            }
            if (action == "SND5")
            {
                AudioManagerModule.getInstance(this).setSndFile("alarmsound5.mp3")
                AudioManagerModule.getInstance(this).playAudio(true)
                AudioManagerModule.getInstance(this).playVibrate(true)
            }

            if (action == "SNDCUSTOM")  // TODO: use switch case if possible
            {
                AudioManagerModule.getInstance(this).setSndFile("customSnd")
                AudioManagerModule.getInstance(this).playAudio(true)
            }

            if (action == "SNDSTOP")  // TODO: use switch case if possible
            {
                AudioManagerModule.getInstance(this).stopPlayAudio()
            }

            if (action == "RECORDSND")  // TODO: use switch case if possible
            {
                AudioManagerModule.getInstance(this).startRecordAudio()
            }

            if (action == "STOPRECORDSND")  // TODO: use switch case if possible
            {
                AudioManagerModule.getInstance(this).stopRecordAudio()
            }

        }catch (e: Exception) {
            System.out.println("parsing exception  ");
        }
    }
}