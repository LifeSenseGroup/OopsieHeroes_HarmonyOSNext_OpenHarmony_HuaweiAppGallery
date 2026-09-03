// entry/src/main/ets/pages/activity_add_drink.ets
import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
import { AddDrinkManager } from '../manager/AddDrinkManager';
import { DrinkType, DrinkTypeHelper } from '../enum/DrinkType';
import { LiquidVolumeUnit, LiquidVolumeUnitHelper } from '../enum/LiquidVolumeUnit';
import { Cycle } from '../model/Cycle';
import { ValidationResult } from '../model/ValidationResult';

interface SelectOption {
  value: string;
}

@Entry
@Component
struct ActivityAddDrink {
  @State selectedDrinkType: DrinkType | null = null;
  @State drinkAmount: string = '';
  @State selectedUnit: LiquidVolumeUnit = LiquidVolumeUnit.Ml;
  @State selectedTime: Date = new Date();
  @State activeCycle: Cycle | null = null;
  @State isLoading: boolean = true;

  private addDrinkManager: AddDrinkManager = AddDrinkManager.getInstance();
  private readonly colorSignaturePurple: string = '#A791A4';
  private unitOptions: SelectOption[] = [
    { value: LiquidVolumeUnitHelper.getDisplayName(LiquidVolumeUnit.Ml) },
    { value: LiquidVolumeUnitHelper.getDisplayName(LiquidVolumeUnit.Oz) },
    { value: LiquidVolumeUnitHelper.getDisplayName(LiquidVolumeUnit.Cup) }
  ];

  async aboutToAppear(): Promise<void> {
    this.isLoading = true;

    // Load favorite volume unit
    const savedUnit: LiquidVolumeUnit = await this.addDrinkManager.getFavoriteVolumeUnit();
    this.selectedUnit = savedUnit;

    // Get or create active cycle
    this.activeCycle = await this.addDrinkManager.getOrCreateActiveCycle();
    this.isLoading = false;

    if (!this.activeCycle) {
      promptAction.showToast({ message: "Failed to initialize measurement cycle" });
    }
  }

  private async onEnterTapped(): Promise<void> {
    const validation: ValidationResult = this.addDrinkManager.validateDrinkInput(
      this.selectedDrinkType,
      this.drinkAmount
    );

    if (!validation.isValid) {
      promptAction.showToast({ message: validation.message });
      return;
    }

    if (!this.activeCycle) {
      promptAction.showToast({ message: "No active cycle found" });
      return;
    }

    const quantity: number = parseInt(this.drinkAmount);
    const success: boolean = await this.addDrinkManager.saveDrink(
      this.selectedDrinkType!,
      quantity,
      this.selectedUnit,
      this.selectedTime,
      this.activeCycle
    );

    if (success) {
      // Save favorite unit
      await this.addDrinkManager.saveFavoriteVolumeUnit(this.selectedUnit);
      promptAction.showToast({ message: "Drink saved!" });
      router.back();
    }
  }

  @Builder DrinkGridItem(drinkType: DrinkType) {
    Button({ type: ButtonType.Normal }) {
      Text(DrinkTypeHelper.getDisplayName(drinkType))
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(this.selectedDrinkType === drinkType ? Color.White : Color.Black)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(this.selectedDrinkType === drinkType ? this.colorSignaturePurple : Color.Transparent)
    .onClick(() => {
      this.selectedDrinkType = drinkType;
    })
    .border({
      width: 0.5,
      color: '#C5C5C5'
    })
  }

  build() {
    Column() {
      if (this.isLoading) {
        LoadingProgress()
          .width(50)
          .height(50)
          .color(this.colorSignaturePurple)
      } else {
        // AppBar
        Row() {
          Button({ type: ButtonType.Normal }) {
            Image($r('app.media.ic_round_close_24px'))
              .width(24).height(24)
              .fillColor(this.colorSignaturePurple)
          }
          .backgroundColor(Color.Transparent)
          .width(48).height(48)
          .onClick(() => {
            router.back();
          })

          Text($r('app.string.add_drink'))
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .layoutWeight(1)
            .textAlign(TextAlign.Center)
            .margin({ right: 48 })
        }
        .width('100%')
        .height(56)
        .alignItems(VerticalAlign.Center)
        .border({ width: { bottom: 1 }, color: this.colorSignaturePurple })

        // Main Content
        Column() {
          Text($r('app.string.choose_drink'))
            .fontSize(16)
            .fontColor(Color.Grey)
            .fontWeight(FontWeight.Medium)
            .margin({ left: 30, top: 15, bottom: 15 })
            .width('100%')

          // Drink Grid
          Grid() {
            ForEach(DrinkTypeHelper.getAllTypes(), (drinkType: DrinkType) => {
              GridItem() {
                this.DrinkGridItem(drinkType)
              }
            })
          }
          .columnsTemplate('1fr 1fr')
          .rowsTemplate('1fr 1fr 1fr')
          .width('100%')
          .height(280)

          // Amount Input
          Row() {
            Text('Amount')
              .fontSize(16)
              .fontColor(Color.Grey)
              .width(80)
              .margin({ left: 12 })

            TextInput({ text: this.drinkAmount, placeholder: "0" })
              .type(InputType.Number)
              .maxLength(4)
              .textAlign(TextAlign.Center)
              .backgroundColor(Color.Transparent)
              .layoutWeight(1)
              .onChange((value: string) => {
                this.drinkAmount = value;
              })

            Select(this.unitOptions)
              .selected(this.selectedUnit)
              .value(this.unitOptions[this.selectedUnit].value)
              .onSelect((index: number) => {
                this.selectedUnit = index as LiquidVolumeUnit;
              })
              .width(80)
          }
          .width('100%')
          .height(60)
          .border({ width: { bottom: 1 }, color: '#E0E0E0' })
          .margin({ top: 20, bottom: 20 })

          // Time Input
          Row() {
            Text('Time')
              .fontSize(16)
              .fontColor(Color.Grey)
              .width(80)
              .margin({ left: 12 })

            TimePicker({ selected: this.selectedTime })
              .useMilitaryTime(true)
              .height('100%')
              .layoutWeight(1)
              .onChange((value: TimePickerResult) => {
                const newTime: Date = new Date(this.selectedTime);
                newTime.setHours(value.hour, value.minute);
                this.selectedTime = newTime;
              })
          }
          .width('100%')
          .height(60)
          .margin({ bottom: 30 })

          // Enter Button
          Button($r('app.string.enter'))
            .type(ButtonType.Normal)
            .backgroundColor(this.selectedDrinkType ? this.colorSignaturePurple : Color.Gray)
            .fontColor(Color.White)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .height(50)
            .width('80%')
            .onClick(() => this.onEnterTapped())
        }
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 20, right: 20 })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}