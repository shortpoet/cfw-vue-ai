interface SampleData {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      email: string;
      password: string;
    };
  };
}

export const sampleData = {
  data: {
    id: '1',
    type: 'user',
    attributes: {
      name: 'Carlos',
      email: 'carlos@me.io',
      password: 'password',
    },
  },
} as SampleData;
