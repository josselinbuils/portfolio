import { Subject } from '@josselinbuils/utils';
import { Music } from '../../interfaces';

export class AudioController {
  audioStateSubject = new Subject<AudioState>(this.getState());

  private currentMusic?: Music;
  private get paused(): boolean {
    return this.audioElement.paused;
  }
  private readonly playlist: Music[] = [];
  private progress = 0;
  private random = false;
  private repeat = false;

  constructor(private readonly audioElement: HTMLAudioElement) {
    audioElement.addEventListener('ended', this.musicEndListener);
    audioElement.addEventListener('timeupdate', this.timeUpdateListener);
  }

  destroy = (): void => {
    this.audioElement.removeEventListener('ended', this.musicEndListener);
    this.audioElement.removeEventListener(
      'timeupdate',
      this.timeUpdateListener
    );
  };

  next = async (): Promise<void> => {
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

    this.loadMusic(this.playlist[newIndex]);

    if (!this.paused) {
      await this.play();
    }
  };

  play = async (): Promise<void> => {
    if (this.currentMusic === undefined) {
      return;
    }

    if (this.paused) {
      await this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
    this.publishState();
  };

  playMusic = async (music: Music): Promise<void> => {
    if (this.currentMusic === undefined || music.id !== this.currentMusic.id) {
      this.loadMusic(music);
    }
    await this.play();
  };

  prev = async (): Promise<void> => {
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

    this.loadMusic(this.playlist[newIndex]);

    if (!this.paused) {
      await this.play();
    }
  };

  /**
   * @param value 0 -> 1
   */
  setCurrentTime = (value: number): void => {
    const duration = this.audioElement.duration;

    this.audioElement.currentTime = Math.min(
      Math.round(value * duration),
      duration - 1
    );
  };

  toggleRepeat = (): void => {
    this.repeat = !this.repeat;
    this.publishState();
  };

  toggleRandom = (): void => {
    this.random = !this.random;
    this.publishState();
  };

  private getState(): AudioState {
    return {
      currentMusic: this.currentMusic,
      paused: this.paused,
      playlist: this.playlist,
      progress: this.progress,
      random: this.random,
      repeat: this.repeat
    };
  }

  private loadMusic(music: Music): void {
    if (!this.playlist.includes(music)) {
      throw new Error('playlist does not contain the given music');
    }
    this.currentMusic = music;
    this.progress = 0;
    this.publishState();
  }

  private readonly musicEndListener = async () => {
    if (!this.repeat) {
      await this.next();
    }
    await this.play();
  };

  private publishState(): void {
    this.audioStateSubject.next(this.getState());
  }

  private readonly rand = async (): Promise<void> => {
    const newIndex = Math.round(this.playlist.length * Math.random());

    this.loadMusic(this.playlist[newIndex]);

    if (!this.paused) {
      await this.play();
    }
  };

  private readonly timeUpdateListener = () => {
    this.progress =
      Math.round(
        (this.audioElement.currentTime / this.audioElement.duration) * 10000
      ) / 100;
    this.publishState();
  };
}

export interface AudioState {
  currentMusic?: Music;
  paused: boolean;
  playlist: Music[];
  progress: number;
  random: boolean;
  repeat: boolean;
}
