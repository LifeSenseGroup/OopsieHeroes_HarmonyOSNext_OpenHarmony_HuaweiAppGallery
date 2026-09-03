package com.lifesensegroup.oopsieheroes.audioManager

import android.content.Context
import android.content.res.AssetFileDescriptor
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.os.Build
import android.os.Handler
import com.lifesensegroup.oopsieheroes.R
import java.io.File
import java.io.IOException
import kotlin.math.roundToInt
import android.os.Vibrator
import android.os.VibrationEffect

class AudioManagerModule private constructor(private val context: Context) {

	companion object {
		private var instance: AudioManagerModule? = null

		fun getInstance(context: Context): AudioManagerModule {
			if (instance == null) {
				instance = AudioManagerModule(context)
			}
			return instance!!
		}
	}

	// Declare a global Handler and Runnable
	val handler = Handler()
	var runnable: Runnable? = null

	private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

	private var soundFile: String = "alarmsound1.mp3"
	private var mediaRecorder: MediaRecorder? = null
	private var mediaPlayer: MediaPlayer? = null
	private var alarmVolume = false
	private var vibrate = 0;

	fun setSndFile(soundFileName: String) {
		soundFile = soundFileName
	}

	fun setVibrate(vibrateVolume: Int) {
		vibrate = vibrateVolume
	}

	fun setMinAlarmVolumeLevel(minVolume: Double) {
		val currentAlarmVolume = audioManager.getStreamVolume(AudioManager.STREAM_ALARM).toDouble()
		val maxAlarmVolume = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM).toDouble()
		if (currentAlarmVolume < (maxAlarmVolume * minVolume)) {
			audioManager.setStreamVolume(AudioManager.STREAM_ALARM, (maxAlarmVolume * minVolume).roundToInt(), AudioManager.FLAG_VIBRATE)
		}
		alarmVolume = true
	}

	fun startRecordAudio() {
		val file = File(context.filesDir, "recorded_audio.3gp")
		mediaRecorder = MediaRecorder()

		mediaRecorder?.apply {
			setAudioSource(MediaRecorder.AudioSource.MIC)
			setOutputFormat(MediaRecorder.OutputFormat.THREE_GPP)
			setAudioEncoder(MediaRecorder.AudioEncoder.AMR_NB)
			setOutputFile(file.absolutePath)

			try {
				prepare()
				start()
			} catch (e: IOException) {
				e.printStackTrace()
			} catch (e: IllegalStateException) {
				e.printStackTrace()
			}
		}
		Handler().postDelayed({ // autostop after 3 sec
			stopRecordAudio()
		}, 3000)
	}

	fun stopRecordAudio() {
		try {
			mediaRecorder?.stop()
			mediaRecorder?.reset()
			mediaRecorder?.release()
		} catch (e: IllegalStateException) {
			e.printStackTrace()
		}
	}

	fun stopPlayAudio() {
		try {
			mediaPlayer?.let {
				if (it.isPlaying) {
					it.stop()
					it.reset()
					it.release()
				}
			}
			// Stop vibration if it's currently running
			stopVibrate()
		} catch (e: IllegalStateException) {
			e.printStackTrace()
		}
	}

	private fun stopVibrate() {
		val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
		vibrator.cancel()
	}


	fun playVibrate(stopAfterXsec: Boolean) {
		if (vibrate > 0) {
			//val vibrationDuration = 17000 // 17 seconds in milliseconds
			val vibrationDuration = 600000   // 10 minutes in miliseconds
			val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
			if (Build.VERSION.SDK_INT >= 26) {
				vibrator.vibrate(VibrationEffect.createOneShot(vibrationDuration.toLong(), VibrationEffect.DEFAULT_AMPLITUDE))
			} else {
				// Deprecated in API 26
				vibrator.vibrate(vibrationDuration.toLong())
			}

			//Reset vibrate after the vibration duration
			Handler().postDelayed({
				vibrate = 0
			}, vibrationDuration.toLong())
		}
	}

	fun playAudio(stopAfterXsec: Boolean) {

		try {stopPlayAudio()} catch (e: IllegalStateException) {
			e.printStackTrace()
		}
		//if (stopAfterXsec) {
		//Handler().postDelayed({ // autostop after 3 sec
		//	stopPlayAudio()
		//}, 3000) }

		if (stopAfterXsec) {
			// Remove any previously posted callbacks
			runnable?.let { handler.removeCallbacks(it) }

			// Create a new Runnable for stopping audio after 3 seconds
			runnable = Runnable {
				stopPlayAudio()
			}

			// Post the Runnable with a delay of 3 seconds
			handler.postDelayed(runnable!!, 3000)
		}

		var resID: Int = -1111
		val file: File = File(context.filesDir, "recorded_audio.3gp")

		when (soundFile) {
			"alarmsound1.mp3" -> resID = R.raw.alarmsound1
			"alarmsound2.mp3" -> resID = R.raw.alarmsound2
			"alarmsound3.mp3" -> resID = R.raw.alarmsound3
			"alarmsound4.mp3" -> resID = R.raw.alarmsound4
			"alarmsound5.mp3" -> resID = R.raw.alarmsound5
			"customSnd" -> resID = -9999
		}

		if (resID == -9999) {
			if (!file.exists()) {
				resID = -1111
				if (alarmVolume) resID = R.raw.alarmsound1
			}
		}

		try {
			if (resID != -1111) {
				mediaPlayer = MediaPlayer()
				mediaPlayer?.setOnCompletionListener {
					mediaPlayer?.reset()
					mediaPlayer?.release()
				}

				mediaPlayer?.setOnPreparedListener { mediaPlayer?.start() }
				if (resID == -9999) {
					mediaPlayer?.setDataSource(file.absolutePath)
				} else {
					val afd: AssetFileDescriptor = context.resources.openRawResourceFd(resID)
					mediaPlayer?.setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
					afd.close()
				}

				var audioAttr = AudioAttributes.USAGE_ALARM
				var audiotype = AudioManager.STREAM_ALARM
				if (!alarmVolume) {
					audioAttr = AudioAttributes.USAGE_MEDIA
					audiotype = AudioManager.STREAM_MUSIC
				}

				if (Build.VERSION.SDK_INT >= 21) {
					mediaPlayer?.setAudioAttributes(
						AudioAttributes.Builder()
							.setUsage(audioAttr)
							.setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
							.build()
					)
				} else {
					mediaPlayer?.setAudioStreamType(audiotype)
				}

				mediaPlayer?.isLooping = true
				mediaPlayer?.prepare()
				alarmVolume = false
			}
		} catch (e: Exception) {
			e.printStackTrace()
		}
	}
}
