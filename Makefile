SOURCE := more.md
TARGET := more.html
STYLE := more.css

all: 
	pandoc --mathml -t html -Ss -o $(TARGET) --css $(STYLE) $(SOURCE)
