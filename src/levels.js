function a(delay, size, count, speed, movement, color) {
    return {
        delay: delay,
        enemies: count,
        movement: movement,
        speed: speed,
        fire: false,
        size: size,
        color: color,
        hits: 15,
        value: 100,
        damage: 5
    };
}

function b(delay, size, count, speed, movement, color) {
    return {
        delay: delay,
        enemies: count,
        movement: movement,
        speed: speed,
        fire: false,
        size: size,
        color: color,
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
                    a(1500, 30, 9, 0.3, "elliptical", 0x73880A),
                    b(15000, 20, 6, 0.5, "diagonal", 0x6BBA70)
                ]
            },
            {
                name: "Wave 2",
                groups: [
                    a(1500, 40, 8, 0.4, "elliptical", 0x73880A),
                    b(15000, 20, 16, 0.3, "diagonal", 0x6BBA70),
                    b(30000, 10, 16, 0.5, "hunter", 0xBA3370)
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
                    a(1500, 30, 6, 0.2, "elliptical", 0x73880A),
                    a(15000, 30, 6, 0.3, "elliptical", 0x73880A),
                    b(30000, 20, 6, 0.5, "hunter", 0xBA3370),
                    b(45000, 10, 6, 0.4, "diagonal", 0x6BBA70)
                ]
            },
            {
                name: "Wave 2",
                groups: [
                    a(1500, 40, 5, 0.5, "elliptical", 0x73880A),
                    a(15000, 40, 5, 0.5, "elliptical", 0x73880A),
                    b(30000, 20, 5, 0.3, "diagonal", 0x6BBA70),
                    b(45000, 40, 5, 0.7, "hunter", 0xBA3370),
                    b(60000, 20, 5, 0.4, "diagonal", 0x6BBA70)
                ]
            }
        ]
    }
];
