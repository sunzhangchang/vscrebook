import { Inteval } from "@vscrebook/utils"
import _ from "lodash"

export class Showing {
    public isBoss = false

    // public autoFlipping: NodeJS.Timeout | null = null
    // public showBossInterval: NodeJS.Timeout | null = null
    // public isAutoFlipping: boolean = false
    // public isShowBossInteval: boolean = false
    public autoFlipping: Inteval = new Inteval()
    public showBossInterval: Inteval = new Inteval()

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