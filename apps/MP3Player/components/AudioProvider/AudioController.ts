import { Subject } from '@josselinbuils/utils/Subject';
import dayjs from 'dayjs';
import { Music } from '../../interfaces/Music';

export class AudioController {
  audioStateSubject: Subject<AudioState>;

  private readonly audioElement = new Audio();
  private currentMusic?: Music;
  private currentTime = '00:00';
  private get paused(): boolean {
    return this.audioElement.paused;
  }
  private playlist: Music[] = [];
  private progress = 0;
  private random = false;
  private repeat = false;

  constructor() {
    this.audioElement.addEventListener('ended', this.musicEndListener);
    this.audioElement.addEventListener('timeupdate', this.timeUpdateListener);
    this.audioStateSubject = new Subject(this.getState());
  }

  clear(): void {
    this.audioElement.removeEventListener('ended', this.musicEndListener);
    this.audioElement.removeEventListener(
      'timeupdate',
      this.timeUpdateListener
    );
    this.audioElement.pause();
  }

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

    const { paused } = this;

    this.loadMusic(this.playlist[newIndex]);

    if (!paused) {
      await this.play();
    }
  };

  play = async (): Promise<void> => {
    if (this.currentMusic === undefined) {
      return;
    }

    let promise = Promise.resolve();

    if (this.paused) {
      promise = this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
    this.publishState();
    await promise;
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

    const { paused } = this;

    this.loadMusic(this.playlist[newIndex]);

    if (!paused) {
      await this.play();
    }
  };

  /**
   * @param value 0 -> 1
   */
  setCurrentTime = (value: number): void => {
    const { duration } = this.audioElement;

    this.audioElement.currentTime = Math.min(
      Math.round(value * duration),
      duration - 1
    );
  };

  setPlaylist = (playlist: Music[]): void => {
    this.playlist = playlist;
    this.publishState();
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
      currentTime: this.currentTime,
      paused: this.paused,
      playlist: this.playlist,
      progress: this.progress,
      random: this.random,
      repeat: this.repeat,
    };
  }

  private loadMusic(music: Music): void {
    if (!this.playlist.includes(music)) {
      throw new Error('playlist does not contain the given music');
    }
    this.currentMusic = music;
    this.audioElement.src = music.audio;
    this.audioElement.load();
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
    const { paused } = this.audioElement;

    this.loadMusic(this.playlist[newIndex]);

    if (!paused) {
      await this.play();
    }
  };

  private readonly timeUpdateListener = () => {
    this.currentTime = dayjs(
      Math.round(this.audioElement.currentTime) * 1000
    ).format('mm:ss');
    this.progress =
      Math.round(
        (this.audioElement.currentTime / this.audioElement.duration) * 10000
      ) / 100;
    this.publishState();
  };
}

export interface AudioState {
  currentMusic?: Music;
  currentTime: string;
  paused: boolean;
  playlist: Music[];
  progress: number;
  random: boolean;
  repeat: boolean;
}
