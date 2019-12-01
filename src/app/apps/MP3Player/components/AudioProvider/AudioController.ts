import { Subject } from '@josselinbuils/utils';
import { Music } from '../../interfaces';

export class AudioController {
  currentMusic?: Music;
  currentMusicSubject = new Subject<Music>();
  playlist: Music[] = [];
  progress = 0;
  random = false;
  repeat = false;

  constructor(private readonly audioElement: HTMLAudioElement) {
    audioElement.addEventListener('ended', this.musicEndListener);
    audioElement.addEventListener('timeupdate', this.timeUpdateListener);
  }

  destroy(): void {
    this.audioElement.removeEventListener('ended', this.musicEndListener);
    this.audioElement.removeEventListener(
      'timeupdate',
      this.timeUpdateListener
    );
  }

  async next(): Promise<void> {
    if (this.currentMusic === undefined) {
      return;
    }

    if (this.random) {
      return this.rand();
    }

    let newIndex = this.playlist.indexOf(this.currentMusic) + 1;

    if (newIndex >= this.playlist.length) {
      newIndex = 0;
    }

    const paused = this.audioElement.paused;

    this.loadMusic(this.playlist[newIndex]);

    if (!paused) {
      await this.play();
    }
  }

  async play(): Promise<void> {
    if (this.audioElement.paused) {
      await this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
  }

  async playMusic(music: Music): Promise<void> {
    if (this.currentMusic === undefined || music.id !== this.currentMusic.id) {
      this.loadMusic(music);
    }
    await this.play();
  }

  async prev(): Promise<void> {
    if (this.currentMusic === undefined) {
      return;
    }

    if (this.random) {
      return this.rand();
    }

    let newIndex = this.playlist.indexOf(this.currentMusic) - 1;

    if (newIndex < 0) {
      newIndex = this.playlist.length - 1;
    }

    const paused = this.audioElement.paused;

    this.loadMusic(this.playlist[newIndex]);

    if (!paused) {
      await this.play();
    }
  }

  async rand(): Promise<void> {
    const newIndex = Math.round(this.playlist.length * Math.random());
    const paused = this.audioElement.paused;

    this.loadMusic(this.playlist[newIndex]);

    if (!paused) {
      await this.play();
    }
  }

  /**
   * @param value 0 -> 1
   */
  setCurrentTime(value: number): void {
    const duration = this.audioElement.duration;
    this.audioElement.currentTime = Math.min(
      Math.round(value * duration),
      duration - 1
    );
  }

  private loadMusic(music: Music): void {
    if (!this.playlist.includes(music)) {
      throw new Error('playList does not contain the given music');
    }
    this.currentMusic = music;
    this.currentMusicSubject.next(music);
    this.progress = 0;
  }

  private readonly musicEndListener = async () => {
    if (!this.repeat) {
      await this.next();
    }
    await this.play();
  };

  private readonly timeUpdateListener = () => {
    this.progress =
      Math.round(
        (this.audioElement.currentTime / this.audioElement.duration) * 10000
      ) / 100;
  };
}
