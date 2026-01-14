# Tarot image download script (PowerShell)

# NOTE: Verify licensing on each Wikimedia Commons file page before using images publicly.

$dest = Join-Path -Path $PSScriptROOT -ChildPath '..\public\tarot'
if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest | Out-Null
}

Write-Host "Destination: $dest"

# --- Major Arcana (Jean Dodal) ---
$major = @(
    @{ id = 'MA0'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_Fool.jpg' },
    @{ id = 'MA1'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_01.jpg' },
    @{ id = 'MA2'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_02.jpg' },
    @{ id = 'MA3'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_03.jpg' },
    @{ id = 'MA4'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_04.jpg' },
    @{ id = 'MA5'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_05.jpg' },
    @{ id = 'MA6'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_06.jpg' },
    @{ id = 'MA7'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_07.jpg' },
    @{ id = 'MA8'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_08.jpg' },
    @{ id = 'MA9'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_09.jpg' },
    @{ id = 'MA10'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_10.jpg' },
    @{ id = 'MA11'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_11.jpg' },
    @{ id = 'MA12'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_12.jpg' },
    @{ id = 'MA13'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_13.jpg' },
    @{ id = 'MA14'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_14.jpg' },
    @{ id = 'MA15'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_15.jpg' },
    @{ id = 'MA16'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_16.jpg' },
    @{ id = 'MA17'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_17.jpg' },
    @{ id = 'MA18'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_18.jpg' },
    @{ id = 'MA19'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_19.jpg' },
    @{ id = 'MA20'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_20.jpg' },
    @{ id = 'MA21'; url = 'https://commons.wikimedia.org/wiki/Special:FilePath/File:Jean_Dodal_Tarot_trump_21.jpg' }
)

foreach ($it in $major) {
    $out = Join-Path $dest ($it.id + '.jpg')
    Write-Host "Downloading $($it.url) -> $out"
    try {
        Invoke-WebRequest -Uri $it.url -OutFile $out -MaximumRedirection 10 -UseBasicParsing
    } catch {
        Write-Warning "Failed to download $($it.url): $_"
    }
}

# --- Minor Arcana (Tarot de Marseille single-card naming convention)
# Files in the Commons category use names like: 1P_Tarot.png, 4C_Tarot.png, JB_Tarot.png, HC_Tarot.png, etc.

$suitMap = @{ B = 'Wands'; C = 'Cups'; S = 'Swords'; P = 'Pentacles' }
$rankMap = @{
    1 = 'Ace'; 2 = 'Two'; 3 = 'Three'; 4 = 'Four'; 5 = 'Five'; 6 = 'Six'; 7 = 'Seven'; 8 = 'Eight'; 9 = 'Nine'; 10 = 'Ten'
}

# Download numeric pip cards 1..10 for each suit
foreach ($n in 1..10) {
    foreach ($s in $suitMap.Keys) {
        $rankName = $rankMap[$n]
        $suitName = $suitMap[$s]
        $id = "${rankName}_${suitName}"
        $fileName = "${n}${s}_Tarot.png"
        $url = "https://commons.wikimedia.org/wiki/Special:FilePath/File:$fileName"
        $out = Join-Path $dest ($id + '.png')
        Write-Host "Downloading $url -> $out"
        try {
            Invoke-WebRequest -Uri $url -OutFile $out -MaximumRedirection 10 -UseBasicParsing
        } catch {
            Write-Warning "Failed: $url -> $_"
        }
    }
}

# Download court cards: J = Page (Jack), H = Knight, Q = Queen, K = King
$courtMap = @{ J = 'Page'; H = 'Knight'; Q = 'Queen'; K = 'King' }
foreach ($c in $courtMap.Keys) {
    foreach ($s in $suitMap.Keys) {
        $rankName = $courtMap[$c]
        $suitName = $suitMap[$s]
        $id = "${rankName}_${suitName}"
        $fileName = "${c}${s}_Tarot.png"
        $url = "https://commons.wikimedia.org/wiki/Special:FilePath/File:$fileName"
        $out = Join-Path $dest ($id + '.png')
        Write-Host "Downloading $url -> $out"
        try {
            Invoke-WebRequest -Uri $url -OutFile $out -MaximumRedirection 10 -UseBasicParsing
        } catch {
            Write-Warning "Failed: $url -> $_"
        }
    }
}

Write-Host "Done. Check the public/tarot/ directory for downloaded images."
