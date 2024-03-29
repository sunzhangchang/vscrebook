import { Interval } from "@vscrebook/utils"

export class Showing {
    public isBoss = false

    public autoFlipping = new Interval()
    public showBossInterval = new Interval()

    constructor(
        public showText: ShowText,
        public showBoss_: () => void,
    ) {
    }

    showBoss() {
        this.showBoss_()
        this.isBoss = true
    }

    setShowBossInterval(): void {
        this.showBossInterval.set(() => {
            this.showBoss()
            this.showBossInterval.clear()
        }, 25 * 1000)
    }

    setAutoFlipInterval(showNext: () => void, autoFlipTime: number): void {
        this.showBossInterval.clear()
        this.autoFlipping.set(() => showNext(), autoFlipTime)
    }

    refreshAuto(): void {
        this.autoFlipping.clear()
        this.showBossInterval.clear()
        this.setShowBossInterval()
    }
}