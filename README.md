# raspid

For use with the Raspid HAT

## Example

    const raspid = require('raspid')();

    raspid.on('idcard', function (id) {
        if (id.join(':') == '64:112:93:53') {
            raspid.openDoor(3000); // three seconds
        }
    });
