export const generateRandomInt = (max:number) : number => {
    return Math.floor(Math.random() * max + 1);
}

export const getRandomDelay = (min:number, max:number) : number => {
    return Math.floor(Math.random() * (max - min) + min);
}

export const timer = (ms:number) => new Promise(res => setTimeout(res, ms))


/**
 * Bumble swipe faker
 */
export const generateSwipeAction = () :  SwipeAction => {    
    return  { name: generateRandomInt(2) === 1 ? SwipeActionsKeyboardKeysBumbleEnum.YES : SwipeActionsKeyboardKeysBumbleEnum.NO }
}

interface SwipeAction {
    name: string
}
enum SwipeActionsKeyboardKeysBumbleEnum {
    NO = "ArrowLeft",
    YES = "ArrowRight"
}