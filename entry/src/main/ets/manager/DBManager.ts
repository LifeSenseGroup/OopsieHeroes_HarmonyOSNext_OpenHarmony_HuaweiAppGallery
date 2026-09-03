import relationalStore from '@ohos.data.relationalStore';
import { Context } from '@kit.AbilityKit';

// Define Interfaces matching your Data Models
export interface Cycle {
  number: number;
  startDate: Date;
  isFinished: boolean;
}

export interface Leak {
  id: number;
  startDate: Date;
  endDate?: Date;
  date: Date;
  volume: number;
  activity: number; // 0=Rest, 1=Active, etc.
  duration: number; // in seconds
  cycleNumber: number;
}

export interface DrinkRecord {
  id: number;
  cycleNumber: number;
  type: string;
  amount: number;
  date: Date;
}

export class DBManager {
  private static instance: DBManager;
  private store: relationalStore.RdbStore | null = null;
  private context: Context | null = null;

  // Database Config
  private readonly DB_NAME = 'CarinStore.db';
  private readonly DB_VERSION = 1;

  // Table SQLs
  private readonly CREATE_CYCLE_TABLE = `
    CREATE TABLE IF NOT EXISTS CYCLE_TABLE (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      NUMBER INTEGER,
      START_DATE INTEGER,
      IS_FINISHED INTEGER DEFAULT 0
    )`;

  private readonly CREATE_LOG_TABLE = `
    CREATE TABLE IF NOT EXISTS LOG_TABLE (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      TYPE TEXT,
      VALUE INTEGER,
      DATE INTEGER,
      NOTE TEXT
    )`;

  private readonly CREATE_DRINK_TABLE = `
    CREATE TABLE IF NOT EXISTS DRINK_TABLE (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      CYCLE_NUMBER INTEGER,
      TYPE TEXT,
      AMOUNT INTEGER,
      DATE INTEGER
    )`;

  private readonly CREATE_LEAK_TABLE = `
    CREATE TABLE IF NOT EXISTS LEAK_TABLE (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      CYCLE_NUMBER INTEGER,
      DATE INTEGER,
      END_DATE INTEGER,
      VOLUME INTEGER,
      ACTIVITY INTEGER,
      DURATION INTEGER
    )`;

  private constructor() {}

  public static getInstance(): DBManager {
    if (!DBManager.instance) {
      DBManager.instance = new DBManager();
    }
    return DBManager.instance;
  }

  public init(context: Context): Promise<void> {
    this.context = context;
    const config: relationalStore.StoreConfig = {
      name: this.DB_NAME,
      securityLevel: relationalStore.SecurityLevel.S1
    };

    return new Promise((resolve, reject) => {
      relationalStore.getRdbStore(context, config, async (err, store) => {
        if (err) {
          console.error(`DBManager: Failed to get RdbStore. Code:${err.code}, message:${err.message}`);
          reject(err);
          return;
        }

        this.store = store;
        await store.executeSql(this.CREATE_CYCLE_TABLE);
        await store.executeSql(this.CREATE_LOG_TABLE);
        await store.executeSql(this.CREATE_DRINK_TABLE);
        await store.executeSql(this.CREATE_LEAK_TABLE);
        await store.executeSql('ALTER TABLE LEAK_TABLE ADD COLUMN END_DATE INTEGER').catch(() => {
          // Older installs may already have this column. relationalStore has no IF NOT EXISTS for ALTER COLUMN.
        });

        console.info('DBManager: Database initialized successfully');
        resolve();
      });
    });
  }

  // --- INTERNAL HELPER ---
  private async getStore(): Promise<relationalStore.RdbStore> {
    if (!this.store) {
      throw new Error("DBManager not initialized. Call init(context) first.");
    }
    return this.store;
  }

  // --- CYCLES ---

  public async createCycle(number: number, startDate: Date): Promise<void> {
    const store = await this.getStore();
    const valueBucket: relationalStore.ValuesBucket = {
      'NUMBER': number,
      'START_DATE': startDate.getTime(),
      'IS_FINISHED': 0
    };
    await store.insert('CYCLE_TABLE', valueBucket);
  }

  public async getLastCycle(): Promise<Cycle | null> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('CYCLE_TABLE');
    predicates.orderByDesc('NUMBER');
    predicates.limitAs(1);

    let resultSet = await store.query(predicates);
    if (resultSet.rowCount === 0) {
      resultSet.close();
      return null;
    }

    resultSet.goToFirstRow();
    const cycle: Cycle = {
      number: resultSet.getLong(resultSet.getColumnIndex('NUMBER')),
      startDate: new Date(resultSet.getLong(resultSet.getColumnIndex('START_DATE'))),
      isFinished: resultSet.getLong(resultSet.getColumnIndex('IS_FINISHED')) === 1
    };
    resultSet.close();
    return cycle;
  }

  public async getCycleByNumber(cycleNumber: number): Promise<Cycle | null> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('CYCLE_TABLE');
    predicates.equalTo('NUMBER', cycleNumber);
    predicates.limitAs(1);

    let resultSet = await store.query(predicates);
    if (resultSet.rowCount === 0) {
      resultSet.close();
      return null;
    }

    resultSet.goToFirstRow();
    const cycle: Cycle = {
      number: resultSet.getLong(resultSet.getColumnIndex('NUMBER')),
      startDate: new Date(resultSet.getLong(resultSet.getColumnIndex('START_DATE'))),
      isFinished: resultSet.getLong(resultSet.getColumnIndex('IS_FINISHED')) === 1
    };
    resultSet.close();
    return cycle;
  }

  public async getLastFinishedCycle(): Promise<Cycle | null> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('CYCLE_TABLE');
    predicates.equalTo('IS_FINISHED', 1);
    predicates.orderByDesc('NUMBER');
    predicates.limitAs(1);

    let resultSet = await store.query(predicates);
    if (resultSet.rowCount === 0) {
      resultSet.close();
      return null;
    }

    resultSet.goToFirstRow();
    const cycle: Cycle = {
      number: resultSet.getLong(resultSet.getColumnIndex('NUMBER')),
      startDate: new Date(resultSet.getLong(resultSet.getColumnIndex('START_DATE'))),
      isFinished: true
    };
    resultSet.close();
    return cycle;
  }

  public async finishCycle(cycleNumber: number): Promise<void> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('CYCLE_TABLE');
    predicates.equalTo('NUMBER', cycleNumber);

    const valueBucket: relationalStore.ValuesBucket = {
      'IS_FINISHED': 1
    };
    await store.update(valueBucket, predicates);
  }

  public async getAllCycles(): Promise<Cycle[]> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('CYCLE_TABLE');
    predicates.orderByDesc('NUMBER');

    let resultSet = await store.query(predicates);
    let cycles: Cycle[] = [];

    while (resultSet.goToNextRow()) {
      cycles.push({
        number: resultSet.getLong(resultSet.getColumnIndex('NUMBER')),
        startDate: new Date(resultSet.getLong(resultSet.getColumnIndex('START_DATE'))),
        isFinished: resultSet.getLong(resultSet.getColumnIndex('IS_FINISHED')) === 1
      });
    }
    resultSet.close();
    return cycles;
  }

  // --- LEAKS (For Video Logic) ---

  public async getLeaksForCycle(cycleNumber: number): Promise<Leak[]> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('LEAK_TABLE');
    predicates.equalTo('CYCLE_NUMBER', cycleNumber);

    let resultSet = await store.query(predicates);
    let leaks: Leak[] = [];

    while (resultSet.goToNextRow()) {
      leaks.push({
        id: resultSet.getLong(resultSet.getColumnIndex('ID')),
        cycleNumber: resultSet.getLong(resultSet.getColumnIndex('CYCLE_NUMBER')),
        startDate: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE'))),
        date: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE'))),
        endDate: this.getOptionalDate(resultSet, 'END_DATE'),
        volume: resultSet.getLong(resultSet.getColumnIndex('VOLUME')),
        activity: resultSet.getLong(resultSet.getColumnIndex('ACTIVITY')),
        duration: resultSet.getLong(resultSet.getColumnIndex('DURATION'))
      });
    }
    resultSet.close();
    return leaks;
  }

  public async getAllLeaks(): Promise<Leak[]> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('LEAK_TABLE');
    predicates.orderByAsc('DATE');

    let resultSet = await store.query(predicates);
    let leaks: Leak[] = [];

    while (resultSet.goToNextRow()) {
      leaks.push({
        id: resultSet.getLong(resultSet.getColumnIndex('ID')),
        cycleNumber: resultSet.getLong(resultSet.getColumnIndex('CYCLE_NUMBER')),
        startDate: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE'))),
        date: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE'))),
        endDate: this.getOptionalDate(resultSet, 'END_DATE'),
        volume: resultSet.getLong(resultSet.getColumnIndex('VOLUME')),
        activity: resultSet.getLong(resultSet.getColumnIndex('ACTIVITY')),
        duration: resultSet.getLong(resultSet.getColumnIndex('DURATION'))
      });
    }
    resultSet.close();
    return leaks;
  }

  public async getLastLeak(): Promise<Leak | null> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('LEAK_TABLE');
    predicates.orderByDesc('DATE');
    predicates.limitAs(1);

    let resultSet = await store.query(predicates);
    if (resultSet.rowCount === 0) {
      resultSet.close();
      return null;
    }

    resultSet.goToFirstRow();
    const leak: Leak = {
      id: resultSet.getLong(resultSet.getColumnIndex('ID')),
      cycleNumber: resultSet.getLong(resultSet.getColumnIndex('CYCLE_NUMBER')),
      startDate: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE'))),
      date: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE'))),
      endDate: this.getOptionalDate(resultSet, 'END_DATE'),
      volume: resultSet.getLong(resultSet.getColumnIndex('VOLUME')),
      activity: resultSet.getLong(resultSet.getColumnIndex('ACTIVITY')),
      duration: resultSet.getLong(resultSet.getColumnIndex('DURATION'))
    };
    resultSet.close();
    return leak;
  }

  public async addLeakToCycle(cycleNumber: number, startDate: Date, activity: number, volume: number = 0): Promise<void> {
    const store = await this.getStore();
    const valueBucket: relationalStore.ValuesBucket = {
      'CYCLE_NUMBER': cycleNumber,
      'DATE': startDate.getTime(),
      'VOLUME': volume,
      'ACTIVITY': activity,
      'DURATION': 0
    };
    await store.insert('LEAK_TABLE', valueBucket);
  }

  public async finishLeak(leakId: number, endDate: Date, didDry: boolean): Promise<void> {
    const store = await this.getStore();
    const leak = await this.getLeakById(leakId);
    let duration = 0;
    if (leak) {
      duration = Math.max(0, Math.floor((endDate.getTime() - leak.startDate.getTime()) / 1000));
    }

    let predicates = new relationalStore.RdbPredicates('LEAK_TABLE');
    predicates.equalTo('ID', leakId);

    const valueBucket: relationalStore.ValuesBucket = {
      'END_DATE': endDate.getTime(),
      'DURATION': duration
    };
    await store.update(valueBucket, predicates);

    if (didDry) {
      await this.createDBEntry('Dry', 0, endDate, '');
    }
  }

  private async getLeakById(leakId: number): Promise<Leak | null> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('LEAK_TABLE');
    predicates.equalTo('ID', leakId);
    predicates.limitAs(1);

    let resultSet = await store.query(predicates);
    if (resultSet.rowCount === 0) {
      resultSet.close();
      return null;
    }

    resultSet.goToFirstRow();
    const leak: Leak = {
      id: resultSet.getLong(resultSet.getColumnIndex('ID')),
      cycleNumber: resultSet.getLong(resultSet.getColumnIndex('CYCLE_NUMBER')),
      startDate: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE'))),
      date: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE'))),
      endDate: this.getOptionalDate(resultSet, 'END_DATE'),
      volume: resultSet.getLong(resultSet.getColumnIndex('VOLUME')),
      activity: resultSet.getLong(resultSet.getColumnIndex('ACTIVITY')),
      duration: resultSet.getLong(resultSet.getColumnIndex('DURATION'))
    };
    resultSet.close();
    return leak;
  }

  // --- DRINKS & LOGS ---

  public async addDrink(cycleNum: number, type: string, amount: number, time: Date): Promise<void> {
    const store = await this.getStore();
    const valueBucket: relationalStore.ValuesBucket = {
      'CYCLE_NUMBER': cycleNum,
      'TYPE': type,
      'AMOUNT': amount,
      'DATE': time.getTime()
    };
    await store.insert('DRINK_TABLE', valueBucket);
  }

  /**
   * Get all drinks for a specific cycle
   * @param cycleNumber The cycle number to get drinks for
   * @returns Promise with array of DrinkRecord
   */
  public async getDrinksForCycle(cycleNumber: number): Promise<DrinkRecord[]> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('DRINK_TABLE');
    predicates.equalTo('CYCLE_NUMBER', cycleNumber);
    predicates.orderByAsc('DATE');

    let resultSet = await store.query(predicates);
    let drinks: DrinkRecord[] = [];

    while (resultSet.goToNextRow()) {
      drinks.push({
        id: resultSet.getLong(resultSet.getColumnIndex('ID')),
        cycleNumber: resultSet.getLong(resultSet.getColumnIndex('CYCLE_NUMBER')),
        type: resultSet.getString(resultSet.getColumnIndex('TYPE')),
        amount: resultSet.getLong(resultSet.getColumnIndex('AMOUNT')),
        date: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE')))
      });
    }
    resultSet.close();
    return drinks;
  }

  /**
   * Get total drinks amount for a specific cycle
   * @param cycleNumber The cycle number to sum drinks for
   * @returns Promise with total amount
   */
  public async getTotalDrinksAmountForCycle(cycleNumber: number): Promise<number> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('DRINK_TABLE');
    predicates.equalTo('CYCLE_NUMBER', cycleNumber);

    // Use raw query for sum
    const sql = `SELECT SUM(AMOUNT) as TOTAL FROM DRINK_TABLE WHERE CYCLE_NUMBER = ?`;
    const resultSet = await store.querySql(sql, [cycleNumber]);

    let total = 0;
    if (resultSet.goToFirstRow()) {
      total = resultSet.getDouble(resultSet.getColumnIndex('TOTAL'));
    }
    resultSet.close();
    return total;
  }

  /**
   * Delete a drink by ID
   * @param drinkId The ID of the drink to delete
   */
  public async deleteDrink(drinkId: number): Promise<void> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('DRINK_TABLE');
    predicates.equalTo('ID', drinkId);
    await store.delete(predicates);
  }

  /**
   * Update a drink
   * @param drinkId The ID of the drink to update
   * @param type New drink type
   * @param amount New amount
   * @param time New time
   */
  public async updateDrink(drinkId: number, type: string, amount: number, time: Date): Promise<void> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('DRINK_TABLE');
    predicates.equalTo('ID', drinkId);

    const valueBucket: relationalStore.ValuesBucket = {
      'TYPE': type,
      'AMOUNT': amount,
      'DATE': time.getTime()
    };
    await store.update(valueBucket, predicates);
  }

  public async createDBEntry(type: string, value: number, date: Date, note: string): Promise<void> {
    const store = await this.getStore();
    const valueBucket: relationalStore.ValuesBucket = {
      'TYPE': type,
      'VALUE': value,
      'DATE': date.getTime(),
      'NOTE': note
    };
    await store.insert('LOG_TABLE', valueBucket);
  }

  /**
   * Get all log entries
   * @returns Promise with array of log entries
   */
  public async getAllLogEntries(): Promise<Array<{type: string, value: number, date: Date, note: string}>> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('LOG_TABLE');
    predicates.orderByDesc('DATE');

    let resultSet = await store.query(predicates);
    let logs: Array<{type: string, value: number, date: Date, note: string}> = [];

    while (resultSet.goToNextRow()) {
      logs.push({
        type: resultSet.getString(resultSet.getColumnIndex('TYPE')),
        value: resultSet.getLong(resultSet.getColumnIndex('VALUE')),
        date: new Date(resultSet.getLong(resultSet.getColumnIndex('DATE'))),
        note: resultSet.getString(resultSet.getColumnIndex('NOTE'))
      });
    }
    resultSet.close();
    return logs;
  }

  public async deleteAllLogs(): Promise<void> {
    const store = await this.getStore();
    let predicates = new relationalStore.RdbPredicates('LOG_TABLE');
    await store.delete(predicates);
  }

  private getOptionalDate(resultSet: relationalStore.ResultSet, columnName: string): Date | undefined {
    const columnIndex = resultSet.getColumnIndex(columnName);
    if (columnIndex < 0) {
      return undefined;
    }
    try {
      const value = resultSet.getLong(columnIndex);
      return value > 0 ? new Date(value) : undefined;
    } catch (err) {
      return undefined;
    }
  }
}
