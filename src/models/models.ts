// TODO(models): Make this the single complete authenticated-user contract; the data layer currently defines additional fields in a second User type.
export type User = {
  id: string;
  email: string;
  name: string;
};
