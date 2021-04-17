const date = Date.now();

export default [
  {
    text:
      'Admin as starting enquiry',
    date: date,
    color: 'primary'
  },
  {
    text:
      'sales user assigned as per enqiry',
    date: new Date(date - 1000 * 60 * 60),
    color: 'success'
  },
  {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    date: new Date(date - 1000 * 60 * 60 * 24),
    color: 'info'
  },
  {
    text: '3 more people joined your campaign.',
    date: new Date(date - 1000 * 60 * 60 * 24 * 2),
    color: 'warning'
  },
  {
    text: 'Six new friend requests',
    date: new Date(date - 1000 * 60 * 60 * 24 * 31),
    color: 'danger'
  }
];
