using BasicProject.Data.Entities;

namespace BasicProject.Data.Repositories
{
    public interface IQuizRepository : IRepository<Quiz>
    {
        Task<IEnumerable<Quiz>> GetByAuthorAsync(int authorId);
    }
}
