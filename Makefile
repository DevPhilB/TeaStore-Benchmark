# What to call the final executable
TARGET = benchmark

# Which object files that the executable consists of
OBJS= benchmark.o

# What compiler to use
CC = gcc

# Compiler flags, -g for debug, -c to make an object file
CFLAGS = -c -g
LDFLAGS = -L ./libquiche.a
LIBS = -lcurl # -lpthread

# Link the target with all objects and libraries
$(TARGET) : $(OBJS)
	$(CC)  -o $(TARGET) $(OBJS) $(LDFLAGS) $(LIBS)

# Compile the source files into object files
benchmark.o : benchmark.c
	$(CC) $(CFLAGS) $<