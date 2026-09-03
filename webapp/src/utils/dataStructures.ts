
export enum  eTypes{
  MEASURINGDAY_STARTED = "start",
  MEASURINGDAY_STOPPED = "stop", 
  LEAK = "leak",
  APP_INSTALLED = "app_installed"
}

export  enum eMode{
  WAKE = 0,
  SLEEPING = 1, 
  STARTUP = 2, 
  SETTINGS = 3,
  ALARM = 4
}

export interface Settings{
  langues   : string,
  volume    : number,
  sound     : string
}

export interface EventOopsie{
  type      : eTypes,
  value     : number,
  date      : Date,
  extra_info: string,
}

export interface UserData{ 
  
  user_id   : string,
  email     : string, 
  country   : string,
  age       : number, 
  date      : Date,
}

export interface CalendarItem{ 

  title     : string,
  className : string,
  date      : Date, 
  len       : number,
}


