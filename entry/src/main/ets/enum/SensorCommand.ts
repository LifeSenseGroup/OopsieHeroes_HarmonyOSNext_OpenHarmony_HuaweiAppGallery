export enum SensorCommand {
  REQUEST_EVENT = "{'R_EVT':%d}",
  START_MEASURING = "{'W_EVT':'START'}",
  STOP_MEASURING = "{'W_EVT':'STOP'}",
  SEND_TIMER = "{'TMR':'%d'}",
  READ_FIRMWARE = "{'R_SW_V':1}",
  FIRMWARE_UPDATE = "{'FW_UPD':1}",
  LED_ON = "{'W_SENS':1}",
  LED_OFF = "{'W_SENS':0}",
  CLEAR_FLASH = "{'CLR_FLH':1}"
}
