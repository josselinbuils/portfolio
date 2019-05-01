export interface InjectedWindowProps {
  active: boolean;
  id: number;
  visible: boolean;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onSelect(id: number): void;
}
