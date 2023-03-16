export default function logErrors(errorMsgs: any[]) {
    console.log('-=-=-=-=-ERROR-=-=-=-=-=-');
    for (const error of errorMsgs) {
        console.dir(error);
        console.log('-------------------------');
    }
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-');
}