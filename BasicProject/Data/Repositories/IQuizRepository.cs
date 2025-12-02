using BasicProject.Data.Entities;

namespace BasicProject.Data.Repositories
{
    public interface IQuizRepository : IRepository<Quiz>
    {
        Quiz Create (Quiz quiz);
        Quiz? Get (int id);
        Quiz Update (Quiz quiz);
        bool Delete (int id);
        Task<IEnumerable<Quiz>> GetByAuthorAsync(int authorId);
    }
}
