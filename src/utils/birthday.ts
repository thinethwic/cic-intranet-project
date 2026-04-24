interface Member {
    name: string;
    role: string;
    dob: string;
}

export function isTodayBirthday(dob: string): boolean {
    const today = new Date();
    const d = new Date(dob);
    return d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}

export function daysUntilBirthday(dob: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(dob);
    const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    if (next <= today) next.setFullYear(today.getFullYear() + 1);
    return Math.round((next.getTime() - today.getTime()) / 86_400_000);
}

export function formatBirthdayDate(dob: string): string {
    const d = new Date(dob);
    const today = new Date();
    let year = today.getFullYear();
    let next = new Date(year, d.getMonth(), d.getDate());
    if (next < today) { year++; next = new Date(year, d.getMonth(), d.getDate()); }
    return next.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}


export function getTodayBirthdays(members: Member[]) {
    return members.filter((m) => isTodayBirthday(m.dob));
}

export function getUpcomingBirthdays(members: Member[], limit = 5) {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    return members
        .filter((m) => {
            const d = new Date(m.dob);
            const mMonth = d.getMonth();
            const mDate = d.getDate();

            // ✅ ONLY future dates in this year
            return (
                mMonth > todayMonth ||
                (mMonth === todayMonth && mDate > todayDate)
            );
        })
        .map((m) => {
            const d = new Date(m.dob);

            const next = new Date(
                today.getFullYear(),
                d.getMonth(),
                d.getDate()
            );

            const days = Math.ceil(
                (next.getTime() - today.setHours(0, 0, 0, 0)) / 86_400_000
            );

            return {
                ...m,
                days,
                date: next.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
            };
        })
        .sort((a, b) => a.days - b.days)
        .slice(0, limit);
}