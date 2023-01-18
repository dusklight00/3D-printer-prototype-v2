import Printer from './printer.js';
import { generateUUID } from '../utility/utils.js';

export default class PrinterManager {
  constructor(...printerIDs) {
    this.printers = [];
    this.status = new Array(printerIDs.length).fill(false);
    this.queue = [];
    printerIDs.forEach((id) => {
      const printer = new Printer(id);
      this.printers.push(printer);
    });
  }
  addQueue(completionTime) {
    const id = generateUUID();
    this.queue.push({
      id: id,
      completionTime: completionTime,
      isComplete: false,
      isProcessing: false,
    });
    return id;
  }
  getOrderDetail(id) {
    for (let i in this.queue) {
      const order = this.queue[i];
      if (order.id == id) return order;
    }
    return null;
  }
  isOrderComplete(id) {
    const order = this.getOrderDetail(id);
    if (order === null) return null;
    return order.isComplete;
  }
  isOrderProcessing(id) {
    const order = this.getOrderDetail(id);
    if (order === null) return null;
    return order.isProcessing;
  }
  getIncompleteOrderIndex() {
    for (let i in this.queue) {
      const order = this.queue[i];
      const id = order.id;
      const isOrderComplete = this.isOrderComplete(id);
      const isOrderProcessing = this.isOrderProcessing(id);
      if (isOrderComplete) continue;
      if (isOrderProcessing) continue;
      return i;
    }
    return null;
  }
  getFreePrinterIndex() {
    for (let i in this.status) {
      const printerStatus = this.status[i];
      if (!printerStatus) return i;
    }
    return null;
  }
  async assignWork(printerIndex, orderIndex) {
    this.status[printerIndex] = true;
    this.queue[orderIndex].isProcessing = true;
    const completionTime = this.queue[orderIndex].completionTime;
    const printer = this.printers[printerIndex];
    await printer.completeWork(completionTime);
    this.queue[orderIndex].isProcessing = false;
    this.queue[orderIndex].isComplete = true;
    this.status[printerIndex] = false;
  }
  async assignWorkToFreePrinter() {
    const freePrinterIndex = this.getFreePrinterIndex();
    const orderIndex = this.getIncompleteOrderIndex();

    if (freePrinterIndex == null) return false;
    if (orderIndex == null) return false;

    await this.assignWork(freePrinterIndex, orderIndex);
    return true;
  }
  start() {
    const FRAME_RATE = 1;
    this.animation = setInterval(() => {
      this.assignWorkToFreePrinter();
    }, 1000 / FRAME_RATE);
  }
}
