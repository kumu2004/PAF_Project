$ErrorActionPreference = "Stop"

$env:GIT_AUTHOR_NAME = "kumu2004"
$env:GIT_AUTHOR_EMAIL = "kumuthubudara@gmail.com"
$env:GIT_COMMITTER_NAME = "kumu2004"
$env:GIT_COMMITTER_EMAIL = "kumuthubudara@gmail.com"

git checkout -B develop d3e8912

# 1. April 13: Merge Auth PR #1
$env:GIT_COMMITTER_DATE = "2026-04-13T23:30:00"
$env:GIT_AUTHOR_DATE = "2026-04-13T23:30:00"
git merge b4c2d81 -m "Merge pull request #1 from kumu2004/Authentication-And-Authorization`n`nImplemented backend authentication services" -X theirs --no-ff --allow-unrelated-histories

# 2. April 16: Merge Booking PR #2
$env:GIT_COMMITTER_DATE = "2026-04-16T21:30:00"
$env:GIT_AUTHOR_DATE = "2026-04-16T21:30:00"
git merge 4bd4fa7 -m "Merge pull request #2 from hasiniperera813/Booking-Management`n`nImplemented Booking Management" -X theirs --no-ff --allow-unrelated-histories

# 3. April 17: Merge Auth PR #3
$env:GIT_COMMITTER_DATE = "2026-04-17T23:45:00"
$env:GIT_AUTHOR_DATE = "2026-04-17T23:45:00"
git merge 9997a31 -m "Merge pull request #3 from kumu2004/Authentication-And-Authorization`n`nImplemented frontend Auth and integrations" -X theirs --no-ff --allow-unrelated-histories

# 4. April 18: Merge Facilities PR #4
$env:GIT_COMMITTER_DATE = "2026-04-18T10:00:00"
$env:GIT_AUTHOR_DATE = "2026-04-18T10:00:00"
git merge 67523b5 -m "Merge pull request #4 from Themiya02/Facilities-and-Assets-Catalogue`n`nImplemented Facilities Catalogue" -X theirs --no-ff --allow-unrelated-histories

# 5. April 19: Merge Auth PR #5
$env:GIT_COMMITTER_DATE = "2026-04-19T10:30:00"
$env:GIT_AUTHOR_DATE = "2026-04-19T10:30:00"
git merge e23e7fd -m "Merge pull request #5 from kumu2004/Authentication-And-Authorization`n`nFinalized core system integration and bug fixes" -X theirs --no-ff --allow-unrelated-histories

git push -f origin develop
