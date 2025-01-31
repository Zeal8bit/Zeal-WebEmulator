/**
 * SPDX-FileCopyrightText: 2024 Zeal 8-bit Computer <contact@zeal8bit.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function SNESAdapter(Zeal, PIO) {
  const zeal = Zeal;
  const pio = PIO;

  const AXIS_THRESHOLD = 0.75;

  const IO_DATA_1   = 0;
  const IO_DATA_2   = 1;
  const IO_LATCH    = 2;
  const IO_CLOCK    = 3;
  let bitCounter = 0;
  let attached = false;
  const ports = {};

  function gamepadScan() {
    const gamepads = navigator.getGamepads() ?? [];
    const pads = [];
    for (let i = 0; i < gamepads.length; i++) {
      if(gamepads[i] && ports[gamepads[i].index]) {
        pads.push(gamepads[i]);
      }
    }

    return pads;
  }

  const latch = (pin, bit) => {
    const gamepads = gamepadScan();
    bitCounter = 0;


    for(gamepad of gamepads) {
      if(!ports[gamepad.index]) continue; /// this controller is not attached anymore
      const buttons = ports[gamepad.index].buttons;
      const dataPin = ports[gamepad.index].port;

      // clear previous values
      bits = Array.apply(null, Array(16)).map(() => 1);

      // set buttons
      for(let i = 0; i < gamepad.buttons.length; i++) {
        switch(i) {
          case buttons.B: bits[0] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Y: bits[1] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Select: bits[2] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Start: bits[3] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Up: bits[4] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Down: bits[5] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Left: bits[6] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Right: bits[7] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.A: bits[8] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.X: bits[9] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.L: bits[10] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.R: bits[11] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Unused1: bits[12] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Unused2: bits[13] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Unused3: bits[14] = gamepad.buttons[i].pressed ? 0 : 1; break;
          case buttons.Unused4: bits[15] = gamepad.buttons[i].pressed ? 0 : 1; break;
        }
      }

      // set axes
      for(let i = 0; i < gamepad.axes.length; i++) {
        const buttonIndex = ((i + 1) * 2) + 64; // virtual button
        const value = gamepad.axes[i];
        let pressed = false;
  
        let index = buttonIndex;
        if(value > AXIS_THRESHOLD) {
          pressed = true;
          index -= 1;
        }
        if(value < -AXIS_THRESHOLD) {
          pressed = true;
        }
  
        switch(index) {
          case buttons.Up: bits[4] = pressed ? 0 : 1; break;
          case buttons.Down: bits[5] = pressed ? 0 : 1; break;
          case buttons.Left: bits[6] = pressed ? 0 : 1; break;
          case buttons.Right: bits[7] = pressed ? 0 : 1; break;
          case buttons.Unused1: bits[12] = pressed ? 0 : 1; break;
          case buttons.Unused2: bits[13] = pressed ? 0 : 1; break;
          case buttons.Unused3: bits[14] = pressed ? 0 : 1; break;
          case buttons.Unused4: bits[15] = pressed ? 0 : 1; break;
        }
      }

      ports[gamepad.index].bits = bits;

      // set IO_DATA to first button
      pio.pio_set_a_pin(dataPin, bits[bitCounter]);
    }
  };

  const clock = (pin, bit) => {
    bitCounter++;
    for(k of Object.keys(ports)) {
      const bit = ports[k].bits[bitCounter];
      pio.pio_set_a_pin(ports[k].port, bit);
    }
  };

  const attach = () => {
    console.log('attaching snes adapter');
    pio.pio_listen_a_pin_change(IO_LATCH, 1, latch);
    pio.pio_listen_a_pin_change(IO_CLOCK, 1, clock);
    attached = true;
  };

  const detatch = () => {
    console.log('detaching snes adapter');
    pio.pio_unlisten_a_pin_change(IO_LATCH);
    pio.pio_unlisten_a_pin_change(IO_CLOCK);
    detatched = false;
  };

  const connect = (index, mapping) => {
    console.log('attach gamepad', index, mapping);
    ports[index] = { ...mapping, bits: Array.apply(null, Array(16)).map(() => 0) };
  }

  const disconnect = (index) => {
    console.log('detatching gamepad', index);
    delete ports[index];
  }

  const update = (index, mapping) => {
    if(ports[index]) {
      ports[index] = { ...ports[index], ...mapping };
    }
  }

  return {
    attach,
    detatch,
    // buttons,
    attached: () => {
      return attached;
    },
    ports: () => ports,
    connect,
    disconnect,
    update,
  }
}