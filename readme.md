
# lazyTranslate

If you are lazy enough to manually translate your app or project you can try this module. It scans your files and detects strings that must be translated using a pattern (REGEX which you can customise). ouput file is in JSON format (for now).

This module has been tested with laravel project blade template files, it could be improved to support other kinds of project the logic is pretty straightforward and should be replicable :). 


### Installing
run this from your terminal (Needless to say you must have nodejs installed):
```
npm install -g lazytranslate
```

## Usage

```
Usage: lazytranslate -d <scan-directory> -o <output-file-path>

Options:
      --help            Show help                                      [boolean]
      --version         Show version number                            [boolean]
  -d, --scan-directory  Directory to scan for files containing strings to be
                        translated. the scan is recursive.   [string] [required]
  -o, --output          Ouput language file path (write full path with file name
                        and extension). If a file already exists at the
                        specified location, it will just be updated, and
                        existing translation, will not be overriden
                                                             [string] [required]
  -s, --source          Source language                                 [string]
  -t, --target          Target language                                 [string]
  -a, --auto-translate  Activate automatic translation. This uses free API
                        language translation service which is not very accurate,
                        you will still need to cross check and correct things.
                                                                       [boolean]
  -i, --include         comma separated list of file extensions to target. If
                        omitted, lazyTranslate will become less lazy and parse
                        every single file under the specified scan-directory;
                        and that recursively.                            [array]

```

#### Examples 

## Basic

```
lazytranslate -d C:\path\to\my\superProject -o C:\path\to\my\superProject\lang\fr.json -i .blade.php -a -s
```

## With auto translation and specifying file extensions to parse.

```
lazytranslate -d C:\path\to\my\superProject -o C:\path\to\my\superProject\lang\fr.json -i .blade.php -a -s en -t fr
```


#### Contribute

This was made for a specific need; but can be used to for other purposes with little tweeking. feel free to fork, or contribute and features on github.