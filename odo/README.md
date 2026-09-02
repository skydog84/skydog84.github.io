# ODO simple

Offline mileage log. One HTML file. No server, no account, no sync, no
analytics, no network calls at runtime.

Everything you enter is stored in your own browser on your own device and is
never transmitted anywhere. This page is served as five static files; there is
no backend to send anything to.

## Install on iPhone

1. Open <https://skydog84.github.io/odo/> in **Safari** (not Chrome — only
   Safari can install web apps on iOS).
2. Share button → **Add to Home Screen** → Add.
3. Launch it from the icon. Put the phone in airplane mode and launch it again —
   it should open normally. That is your proof the offline cache took.

## What it does

- Separate projects, each with its own mileage rate
- IRS rates stored by effective date, with the Notice each one came from
- The rate is frozen onto a trip when you save it, so correcting the rate table
  later never rewrites history
- Every edit is timestamped; deletes are soft and stay in your exports
- Warns if the same destination is logged twice on one day under two projects
- CSV export, full JSON backup, and a printable report with a signature line
- A trip map drawn from GPS coordinates you capture, with no map tiles

## Back it up

iOS can evict a website's stored data if you don't open it for a while.
**Setup → Full JSON backup**, monthly. That file rebuilds everything.

Not legal or tax advice.
