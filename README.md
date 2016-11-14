# raspid

Interface with the [Raspid HAT](https://raspid.io) for the Raspberry Pi

If running on Raspberry Pi, you must run as root.

## Install

You need a sane buildchain to work with node-gyp for compiling the
dependencies. If you are developing locally, you probably do not have GPIO or
an SPI device. Still trying to figure out the best solution for that, perhaps
a mock device using IPC to communicate.

## Example

```js
const raspid = require('raspid')();

raspid.on('idcard', function (id) {
    let idstr = id.map((n) => { return n.toString(16); }).join(':');

    // Validate that the ID can open the door
    if (idstr == '10:40:E3:CA') {
        // three seconds
        raspid.openDoor(3000);
    }
});
```
