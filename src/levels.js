function green(delay, size, count, speed) {
    return {
        delay: delay,
        enemies: count,
        movement: "elliptical",
        speed: speed,
        fire: false,
        size: size,
        color: 0x73880A,
        hits: 15,
        value: 100,
        damage: 5
    };
}

function blue(delay, size, count, speed) {
    return {
        delay: delay,
        enemies: count,
        movement: "diagonal",
        speed: speed,
        fire: false,
        size: size,
        color: 0x6BBA70,
        hits: 7,
        value: 100,
        damage: 5
    };
}


var LEVELS = [
    {
        name: "Level 1",
        waves: [
            {
                name: "Wave 1",
                groups: [
                    green(1500, 30, 9, 0.3),
                    blue(15000, 20, 6, 0.5)
                ]
            },
            {
                name: "Wave 2",
                groups: [
                    green(1500, 40, 8, 0.4),
                    blue(15000, 20, 16, 0.3),
                    blue(30000, 10, 16, 0.5)
                ]
            }
        ]
    },
    {
        name: "Level 2",
        waves: [
            {
                name: "Wave 1",
                groups: [
                    green(1500, 30, 6, 0.2),
                    green(15000, 30, 6, 0.3),
                    blue(30000, 20, 6, 0.5),
                    blue(45000, 10, 6, 0.4)
                ]
            },
            {
                name: "Wave 2",
                groups: [
                    green(1500, 40, 5, 0.5),
                    green(15000, 40, 5, 0.5),
                    blue(30000, 20, 5, 0.3),
                    blue(45000, 40, 5, 0.7),
                    blue(60000, 20, 5, 0.4)
                ]
            }
        ]
    }
];
