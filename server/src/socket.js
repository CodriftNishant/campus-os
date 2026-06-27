let io;

export const setIO = (socketInstance) => {
  io = socketInstance;
};

export const getIO = () => io;