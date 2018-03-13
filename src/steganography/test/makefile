TARGET = tests

CC=g++
CFLAGS = -std=c++11 $(shell pkg-config --cflags opencv)

LINKER = g++
LFLAGS = $(shell pkg-config --libs opencv) -lboost_filesystem -lboost_system

SRC_EXT = cpp
INC_EXT = hpp

SRC_DIR = src
BUILD_DIR = build
BIN_DIR = bin

SRC_LST = $(wildcard $(SRC_DIR)/*.$(SRC_EXT))
INC_LST = $(wildcard $(SRC_DIR)/*.$(INC_EXT))
OBJ_LST = $(SRC_LST:$(SRC_DIR)/%.$(SRC_EXT)=$(BUILD_DIR)/%.o)

MKDIR = mkdir --parent
RM = rm -rf

$(BIN_DIR)/$(TARGET) : $(OBJ_LST)
	@$(MKDIR) $(BIN_DIR)
	@$(LINKER) $(OBJ_LST) $(LFLAGS) -o $@
	@echo "Successfully linked '"$(TARGET)"'!"

$(OBJ_LST) : $(BUILD_DIR)/%.o : $(SRC_DIR)/%.$(SRC_EXT) $(INC_LST)
	@$(MKDIR) $(BUILD_DIR)
	@$(CC) $(CFLAGS) -c $< -o $@
	@echo "Compiled '"$<"' to '"$@"' successfully!"

.PHONY: configure
configure:
	@curl https://raw.githubusercontent.com/CatchOrg/Catch2/master/single_include/catch.hpp --silent --create-dirs --output src/catch.hpp

.PHONY: clean
clean:
	@$(RM) $(OBJ_LST)
	@$(RM) test_files/steg-*
	@echo "Cleanup complete!"

.PHONY: remove
remove:
	@$(RM) "src/catch.hpp"
	@$(RM) $(BUILD_DIR)
	@$(RM) $(BIN_DIR)
	@echo "Executable removed!"
