export const generateRandomInt = (max:number) : number => {
    return Math.floor(Math.random() * max + 1);
}

export const getRandomDelay = (min:number, max:number) : number => {
    return Math.floor(Math.random() * (max - min) + min);
}

export const timer = (ms:number) => new Promise(res => setTimeout(res, ms))


/**
 * Bumble swipe faker
 * Note : onlyNo set to YES it's important, else if you match someone, that's will "lock" the screen on shitty modal
 */
export const generateSwipeAction = (onlyNo: boolean) :  SwipeAction => {    

    if ( onlyNo === false ) {
        return  { name: generateRandomInt(2) === 1 ? SwipeActionsKeyboardKeysBumbleEnum.YES : SwipeActionsKeyboardKeysBumbleEnum.NO }
    } else {
        return { name: SwipeActionsKeyboardKeysBumbleEnum.NO }
    }
}

interface SwipeAction {
    name: string
}
enum SwipeActionsKeyboardKeysBumbleEnum {
    NO = "ArrowLeft",
    YES = "ArrowRight"
}