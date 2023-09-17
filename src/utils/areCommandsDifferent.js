module.exports = (existingCommand, localCommand) => {
  const areChoicesDifferent = (existingChoices, localChoices) => {
    console.log("Checking if choices are different...");
    for (const localChoice of localChoices) {
      const existingChoice = existingChoices?.find(
        (choice) => choice.name === localChoice.name
      );

      if (!existingChoice) {
        console.log(
          `Existing choice not found for local choice: ${localChoice.name}`
        );
        return true;
      }

      if (localChoice.value !== existingChoice.value) {
        console.log(
          `Choice values are different: Local(${localChoice.value}), Existing(${existingChoice.value})`
        );
        return true;
      }
    }
    console.log("Choices are not different.");
    return false;
  };

  const areOptionsDifferent = (existingOptions, localOptions) => {
    console.log("Checking if options are different...");
    for (const localOption of localOptions) {
      const existingOption = existingOptions?.find(
        (option) => option.name === localOption.name
      );

      if (!existingOption) {
        console.log(
          `Existing option not found for local option: ${localOption.name}`
        );
        return true;
      }

      if (
        localOption.description !== existingOption.description ||
        localOption.type !== existingOption.type ||
        (localOption.required || false) !== existingOption.required ||
        (localOption.choices?.length || 0) !==
          (existingOption.choices?.length || 0) ||
        areChoicesDifferent(
          localOption.choices || [],
          existingOption.choices || []
        )
      ) {
        console.log("Options are different.");
        return true;
      }
    }
    console.log("Options are not different.");
    return false;
  };

  console.log("Comparing existingCommand and localCommand...");
  if (
    existingCommand.description !== localCommand.description ||
    existingCommand.options?.length !== (localCommand.options?.length || 0) ||
    areOptionsDifferent(existingCommand.options, localCommand.options || [])
  ) {
    console.log("Commands are different.");
    return true;
  }

  console.log("Commands are not different.");
  return false;
};
