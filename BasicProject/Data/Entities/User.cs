using System.ComponentModel.DataAnnotations;

namespace BasicProject.Data.Entities
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // GitHub OAuth token - used to identify the user by their GitHub access token
        public string? GitHubAccessToken { get; set; }

        public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
        public ICollection<Attempt> Attempts { get; set; } = new List<Attempt>();
    }
}
