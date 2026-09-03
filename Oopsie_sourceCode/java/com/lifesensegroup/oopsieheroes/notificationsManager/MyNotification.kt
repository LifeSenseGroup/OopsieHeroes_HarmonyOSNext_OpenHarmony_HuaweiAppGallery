package com.lifesensegroup.oopsieheroes.notificationsManager

enum class MyNotification(val raw: String, val id: Int) {
    Alarm("alarm",1),
    SensorDetectionForegroundService("sensor_detection_foreground_service",2);

    companion object {
        fun with(raw: String): MyNotification? {
            return values().find {
                it.raw == raw
            }
        }
    }
}