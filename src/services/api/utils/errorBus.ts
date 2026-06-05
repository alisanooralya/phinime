type ErrorListener = (status: number) => void;

class ErrorBus {
  private listeners: ErrorListener[] = [];

  subscribe(listener: ErrorListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(status: number) {
    this.listeners.forEach((l) => l(status));
  }
}

export const errorBus = new ErrorBus();
