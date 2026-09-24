import FormSchema from "../models/FormSchema";

export const getFormById = async (req, res) => {
  try {
    const form = await FormSchema.findOne({ formId: req.params.id }).lean();
    if (!form) return res.status(404).json({ message: "Form not found" });

    form.fields.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json(form);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
