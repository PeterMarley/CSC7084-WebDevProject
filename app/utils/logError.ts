export default function logErrors(errorMsgs: any[]) {
    for (const error of errorMsgs) {
        console.log(error);
    }
}