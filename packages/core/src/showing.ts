import { Interval } from "@vscrebook/utils"

export type PresentationMode = 'normal' | 'stealth'
export type ApplyPresentationMode = (mode: PresentationMode) => void | Promise<void>

export class Showing {
    public isBoss = false
    public mode: PresentationMode = 'normal'

    public autoFlipping = new Interval()
    public showBossInterval = new Interval()

    constructor(
        public showText: ShowText,
        public showBoss_: () => void,
        private applyMode: ApplyPresentationMode = () => undefined,
    ) {
    }

    async setMode(mode: PresentationMode): Promise<void> {
        if (mode === this.mode) return
        await this.applyMode(mode)
        this.mode = mode
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
