namespace BasicProject.Data.Entities
{
    /// <summary>
    /// Tracks which option a user selected for each question in an attempt
    /// </summary>
    public class AttemptAnswer
    {
        public int Id { get; set; }

        public int AttemptId { get; set; }
        public Attempt? Attempt { get; set; }

        public int QuestionId { get; set; }
        public Question? Question { get; set; }

        public int? SelectedOptionId { get; set; } // Nullable to allow skipped questions
        public QuestionOption? SelectedOption { get; set; }

        public bool IsCorrect { get; set; } // Denormalized for quick access
    }
}
