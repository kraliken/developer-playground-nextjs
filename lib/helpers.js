export function getNextWorkdayAt8AM() {
    const date = new Date();
    date.setHours(8, 0, 0, 0);

    // Ha már elmúlt ma 8 óra, következő nap
    if (date <= new Date()) {
        date.setDate(date.getDate() + 1);
    }

    // Ha hétvége, ugorj a következő hétfőre
    const day = date.getDay();
    if (day === 0) { // vasárnap
        date.setDate(date.getDate() + 1);
    } else if (day === 6) { // szombat
        date.setDate(date.getDate() + 2);
    }

    return date.toISOString();
}