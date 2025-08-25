import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// Define a custom class-validator decorator @Match() that checks whether the value of one property matches another property
// Did this for confirm password field in DTO

export function Match(property: string, validationOptions?: ValidationOptions) {
  return (target: object, propertyName: string) => {
    // Refister the custom validator
    registerDecorator({
      name: 'Match',
      target: target.constructor, // Required by class-validator to bind correctly
      propertyName, // field to validate (e.g confirm password)
      options: validationOptions,
      constraints: [property],
      // Here is the validaiton logic
      validator: {
        validate(
          value: unknown, // cuurent field's value
          { constraints, object }: ValidationArguments,
        ): boolean {
          // Safe comparison
          const relatedProp = constraints[0] as string;
          return (
            typeof object === 'object' &&
            object !== null &&
            value === (object as Record<string, unknown>)[relatedProp]
          );
        },
        // Fallbback error message
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must match ${args.constraints[0]}`;
        },
      },
    });
  };
}
