import block1 from "./assets/block/block_1.png?url"
import block2 from "./assets/block/block_2.png?url"
import block3 from "./assets/block/block_3.png?url"
import block4 from "./assets/block/block_4.png?url"
import block5 from "./assets/block/block_5.png?url"
import block6 from "./assets/block/block_6.png?url"
import block7 from "./assets/block/block_7.png?url"
import block8 from "./assets/block/block_8.png?url"
import block9 from "./assets/block/block_9.png?url"
import block10 from "./assets/block/block_10.png?url"
import block11 from "./assets/block/block_11.png?url"
import block12 from "./assets/block/block_12.png?url"
import block13 from "./assets/block/block_13.png?url"
import block14 from "./assets/block/block_14.png?url"
import block15 from "./assets/block/block_15.png?url"
import block16 from "./assets/block/block_16.png?url"

const BlockImageMap = {
    1: block1,
    2: block2,
    3: block3,
    4: block4,
    5: block5,
    6: block6,
    7: block7,
    8: block8,
    9: block9,
    10: block10,
    11: block11,
    12: block12,
    13: block13,
    14: block14,
    15: block15,
    16: block16,
}

export function GetBlockImageByType(type) {
    return BlockImageMap[type]
}
